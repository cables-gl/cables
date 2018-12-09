
var inTex=op.inObject("Texture");

var outName=op.outValue("Name");
var outWidth=op.outValue("Width");
var outHeight=op.outValue("Height");
var outRatio=op.outValue("Ratio");
var outFilter=op.outValue("Filter");
var outWrap=op.outValue("Wrap");
var outId=op.outValue("Id");

inTex.onChange=function()
{
    if(inTex.get())
    {
        outWidth.set(inTex.get().width);
        outHeight.set(inTex.get().height);
        
        outRatio.set(inTex.get().width/inTex.get().height);
        // console.log(inTex.get());
        outName.set(inTex.get().name);
        
        var strFilter='unknown';
        if(inTex.get().filter==CGL.Texture.FILTER_NEAREST)strFilter='nearest';
        else if(inTex.get().filter==CGL.Texture.FILTER_LINEAR)strFilter='linear';
        else if(inTex.get().filter==CGL.Texture.FILTER_MIPMAP)strFilter='mipmap';

        outFilter.set(inTex.get().filter+' '+strFilter);
        outWrap.set(inTex.get().wrap);
        outId.set(inTex.get().id);
    }
};
