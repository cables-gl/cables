op.name="TextureInfo";

var inTex=op.inObject("Texture");

var outWidth=op.outValue("Width");
var outHeight=op.outValue("Height");
var outRatio=op.outValue("Ratio");

inTex.onChange=function()
{
    if(inTex.get())
    {
        outWidth.set(inTex.get().width);
        outHeight.set(inTex.get().height);
        
        outRatio.set(inTex.get().width/inTex.get().height);
        
    }
};
