const
    inTex = op.inObject("Texture", null, "texture"),
    outName = op.outNumber("Name"),
    outPixelFormat = op.outString("PixelFormat"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    outRatio = op.outNumber("Ratio"),
    outFilter = op.outNumber("Filter"),
    outWrap = op.outNumber("Wrap"),
    outFlipped = op.outBoolNum("Flipped"),
    outFp = op.outBoolNum("HDR"),
    outDefaultEmpty = op.outBoolNum("Is Empty Default Texture", false),
    outDefaultTex = op.outBoolNum("Is Default Texture", false),
    outCubemap = op.outBoolNum("Is Cubemap"),
    outId = op.outNumber("Id");

outFp.setUiAttribs({ "title": "Float Texture" });

const emptyTex = CGL.Texture.getEmptyTexture(op.patch.cgl);
const defaultTex = CGL.Texture.getTempTexture(op.patch.cgl);

inTex.onChange = function ()
{
    if (inTex.get())
    {
        outName.set(inTex.get().name);
        outWidth.set(inTex.get().width);
        outHeight.set(inTex.get().height);
        outRatio.set(inTex.get().width / inTex.get().height);

        let strFilter = "unknown";
        if (inTex.get().filter == CGL.Texture.FILTER_NEAREST)strFilter = "nearest";
        else if (inTex.get().filter == CGL.Texture.FILTER_LINEAR)strFilter = "linear";
        else if (inTex.get().filter == CGL.Texture.FILTER_MIPMAP)strFilter = "mipmap";

        outFilter.set(inTex.get().filter + " " + strFilter);

        let strWrap = "unknown";

        if (inTex.get().wrap == CGL.Texture.WRAP_CLAMP_TO_EDGE) strWrap = "clamp to edge";
        else if (inTex.get().wrap == CGL.Texture.WRAP_REPEAT) strWrap = "repeat";
        else if (inTex.get().wrap == CGL.Texture.WRAP_MIRRORED_REPEAT) strWrap = "mirrored repeat";

        outWrap.set(inTex.get().wrap + " " + strWrap);

        outPixelFormat.set(inTex.get().pixelFormat);
        outId.set(inTex.get().id);
        outFlipped.set(inTex.get().flipped);
        outFp.set(inTex.get().isFloatingPoint && inTex.get().isFloatingPoint());

        outCubemap.set(inTex.get().cubemap);
    }
    else
    {
        outName.set("no texture");
        outWidth.set(0);
        outHeight.set(0);
        outRatio.set(0);
        outFilter.set(null);
        outWrap.set(null);
        outId.set(null);
        outFlipped.set(false);
        outFp.set(false);
        outCubemap.set(false);
    }

    outDefaultEmpty.set(inTex.get() == emptyTex);
    outDefaultTex.set(inTex.get() == defaultTex);
};
