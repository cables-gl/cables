const
    inImgEle = op.inObject("Element", null, "element"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height");

op.setUiAttrib({ "height": 150, "resizable": true });

outWidth.setUiAttribs({ "hidePort": true });
outHeight.setUiAttribs({ "hidePort": true });

inImgEle.onChange = updateSize;

function getSize(ele)
{
    if (!ele) return { "width": 0, "height": 0 };
    if (ele instanceof HTMLVideoElement) return { "width": ele.videoWidth, "height": ele.videoHeight };
    if (ele instanceof HTMLImageElement) return { "width": ele.naturalWidth, "height": ele.naturalHeight };
    return { "width": ele.width || 0, "height": ele.height || 0 };
}

function updateSize()
{
    const size = getSize(inImgEle.get());
    if (size.width == outWidth.get() && size.height == outHeight.get()) return size;
    outWidth.set(size.width);
    outHeight.set(size.height);
    return size;
}

op.renderVizLayer = (ctx, layer, viz) =>
{
    ctx.clearRect(layer.x, layer.y, layer.width, layer.height);
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    if (!inImgEle.get())
    {
        ctx.fillText("no image", layer.x, layer.y + layer.height / 2);
        return;
    }

    const size = updateSize();
    if (!size.width || !size.height)
    {
        ctx.fillText("image not loaded", layer.x, layer.y + layer.height / 2);
        return;
    }

    const scale = Math.min(layer.width / size.width, layer.height / size.height);
    const width = size.width * scale;
    const height = size.height * scale;

    try
    {
        ctx.drawImage(inImgEle.get(), layer.x + (layer.width - width) / 2, layer.y + (layer.height - height) / 2, width, height);
    }
    catch (e)
    {
        ctx.fillText("" + e.message, layer.x, layer.y + layer.height / 2);
    }
};
