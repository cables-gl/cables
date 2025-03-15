const
    filename = op.inUrl("File"),
    texWidth = op.inValueInt("Texture width"),
    texHeight = op.inValueInt("Texture height"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "repeat"),
    tfilter = op.inValueSelect("Filter", ["nearest", "linear", "mipmap"], "mipmap"),
    textureOut = op.outTexture("Texture"),
    outLoaded = op.outBoolNum("Loaded");

tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;

texWidth.set(1024);
texHeight.set(1024);

const cgl = op.patch.cgl;
let canvas = null;
let ctx = null;

function removeCanvas()
{
    if (!canvas) return;
    canvas.remove();
    canvas = null;
}

function createCanvas()
{
    if (canvas)removeCanvas();
    canvas = document.createElement("canvas");
    canvas.id = "svgcanvas";
    ctx = canvas.getContext("2d", { "alpha": true });

    ctx.canvas.width = canvas.width = texWidth.get();
    ctx.canvas.height = canvas.height = texHeight.get();

    canvas.style.display = "none";
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);
}

textureOut.set(new CGL.Texture(cgl));

function reSize()
{
    update();
}

let data = "data:image/svg+xml," +
            "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\">" +
           "<foreignObject width=\"100%\" height=\"100%\">" +
           "<div xmlns=\"http://www.w3.org/1999/xhtml\" style=\"font-size:40px\">" +
           "</div>" +
           "</foreignObject>" +
           "</svg>";

let cgl_filter = CGL.Texture.FILTER_MIPMAP;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;

function onFilterChange()
{
    if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;

    reload();
}

function onWrapChange()
{
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    else if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reload();
}

function reload()
{
    if (!filename.get()) return;
    op.setUiError("error", null);
    const loadingId = op.patch.loading.start("svg file", filename.get(), op);
    CABLES.ajax(
        op.patch.getFilePath(filename.get()),
        function (err, _data, xhr)
        {
            op.patch.loading.finished(loadingId);
            if (!err)
            {
                data = "data:image/svg+xml," + _data;
                data = data.replace(/#/g, "%23");
                update();
            }
            else
            {
                outLoaded.set(false);
                op.logWarn("could not load file", op.patch.getFilePath(filename.get()), err);
                op.setUiError("error", "Could not load SVG file!");
            }
        }
    );
}

let startTime = 0;

function update()
{
    op.setUiError("error", null);
    const img = new Image();
    const loadingId = op.patch.loading.start("svg2texture", filename.get(), op);

    img.onabort = img.onerror = function (e)
    {
        outLoaded.set(false);
        op.logWarn("could not load file",);
        op.patch.loading.finished(loadingId);
        op.setUiError("error", "Could not load SVG file!");
    };

    outLoaded.set(false);

    img.onload = function ()
    {
        cgl.addNextFrameOnceCallback(() =>
        {
            createCanvas();
            op.patch.loading.finished(loadingId);
            canvas.width = texWidth.get();
            canvas.height = texHeight.get();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            textureOut.set(new CGL.Texture.createFromImage(cgl, canvas, {
                "wrap": cgl_wrap,
                "filter": cgl_filter,
                "width": canvas.width,
                "height": canvas.height,
                "unpackAlpha": true
            }));
            removeCanvas();
            outLoaded.set(true);
        });
    };

    img.src = data;
    startTime = performance.now();
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().endsWith(fn))
    {
        reload();
    }
};

filename.onChange = reload;
texWidth.onChange = texHeight.onChange = reSize;

createCanvas();
reSize();

tfilter.set("mipmap");
