const
    inTex=op.inObject("Texture"),
    outName=op.outValue("Name"),
    outWidth=op.outValue("Width"),
    outHeight=op.outValue("Height"),
    outRatio=op.outValue("Ratio"),
    outFilter=op.outValue("Filter"),
    outWrap=op.outValue("Wrap"),
    outFlipped=op.outValue("Flipped"),
    outId=op.outValue("Id");

inTex.onChange=function()
{
    if(inTex.get())
    {
        outName.set(inTex.get().name);
        outWidth.set(inTex.get().width);
        outHeight.set(inTex.get().height);
        outRatio.set(inTex.get().width/inTex.get().height);

        var strFilter='unknown';
        if(inTex.get().filter==CGL.Texture.FILTER_NEAREST)strFilter='nearest';
        else if(inTex.get().filter==CGL.Texture.FILTER_LINEAR)strFilter='linear';
        else if(inTex.get().filter==CGL.Texture.FILTER_MIPMAP)strFilter='mipmap';

        outFilter.set(inTex.get().filter+' '+strFilter);
        outWrap.set(inTex.get().wrap);
        outId.set(inTex.get().id);
        outFlipped.set(inTex.get().flipped);
    }
    else
    {
        outName.set('no texture');
        outWidth.set(0);
        outHeight.set(0);
        outRatio.set(0);
        outFilter.set(null);
        outWrap.set(null);
        outId.set(null);
        outFlipped.set(false);
    }
};