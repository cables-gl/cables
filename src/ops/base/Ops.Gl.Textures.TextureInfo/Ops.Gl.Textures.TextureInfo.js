const
    inTex = op.inObject("Texture"),
    outName = op.outNumber("Name"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    outRatio = op.outNumber("Ratio"),
    outFilter = op.outNumber("Filter"),
    outWrap = op.outNumber("Wrap"),
    outFlipped = op.outNumber("Flipped"),
    outFp = op.outNumber("HDR"),
    outDefaultEmpty = op.outNumber("Is Empty Default Texture", false),
    outDefaultTex = op.outNumber("Is Default Texture", false),
    outId = op.outNumber("Id");

outFp.setUiAttribs({ "title": "Pixelformat Float 32bit" });

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

        outId.set(inTex.get().id);
        outFlipped.set(inTex.get().flipped);
        outFp.set(inTex.get().textureType == CGL.Texture.TYPE_FLOAT);
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
    }

    outDefaultEmpty.set(inTex.get() == emptyTex);
    outDefaultTex.set(inTex.get() == defaultTex);
};
