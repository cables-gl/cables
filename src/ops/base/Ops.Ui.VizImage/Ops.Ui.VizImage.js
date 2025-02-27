const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif", ".svg"]),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    loading = op.outBoolNum("Loading");

op.setUiAttrib({ "height": 150, "resizable": true });

let element = op.patch.getDocument().createElement("img");

// op.patch.cgl.canvas.parentElement.appendChild(element);

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
    loading.set(false);
};

function removeEle()
{
    if (element)element.remove();
    element = null;
}

function filenameChanged(cacheBuster)
{
    let url = filename.get();

    loading.set(true);
    element.setAttribute("src", url);
    op.setUiAttrib({ "extendTitle": CABLES.basename(filename.get()) });
    element.setAttribute("crossOrigin", "anonymous");
    // outImage.setRef(element);
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1) filenameChanged(true);
};

op.renderVizLayer = (ctx, layer, viz) =>
{
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    if (!filename.get())
    {
        ctx.fillText("no filename", layer.x, layer.y + layer.height / 2);
        return;
    }

    try
    {
        const asp = element.width / element.height;
        ctx.drawImage(element, layer.x, layer.y, layer.width, layer.width * asp);
    }
    catch (e)
    {
        ctx.fillText("" + e.message, layer.x, layer.y + layer.height / 2);
    }
};
