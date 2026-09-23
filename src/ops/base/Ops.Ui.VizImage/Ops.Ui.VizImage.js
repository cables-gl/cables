const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif", ".svg"]),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height");

op.setUiAttrib({ "height": 150, "resizable": true, "vizLayerFullOpSize": true });

outWidth.setUiAttribs({ "hidePort": true });
filename.setUiAttribs({ "hidePort": true });
outHeight.setUiAttribs({ "hidePort": true });
let element = op.patch.getDocument().createElement("img");

op.onDelete = removeEle;

filename.onChange = filenameChanged;

filenameChanged();

element.onload = () =>
{
    if (element)
    {
        outWidth.set(element.width);
        outHeight.set(element.height);
    }
    else
    {
        outWidth.set(0);
        outHeight.set(0);
    }

    op.setUiAttrib({ "forceAspect": element.width / element.height });
};

function removeEle()
{
    if (element) element.remove();
    element = null;
}

function filenameChanged(cacheBuster)
{
    let url = filename.get();

    element.setAttribute("src", url);
    op.setUiAttrib({ "extendTitle": CABLES.basename(filename.get()) });
    element.setAttribute("crossOrigin", "anonymous");
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1) filenameChanged(true);
};

op.renderVizLayer = (ctx, layer, viz) =>
{
    ctx.clearRect(layer.x, layer.y, layer.width, layer.height);
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    if (!filename.get())
    {
        ctx.fillText("no filename", layer.x, layer.y + layer.height / 2);
        return;
    }

    try
    {
        ctx.drawImage(element, layer.x, layer.y, layer.width, layer.height);
    }
    catch (e)
    {
        ctx.fillText("" + e.message, layer.x, layer.y + layer.height / 2);
    }
};
