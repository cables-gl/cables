const
    inExe=op.inTrigger("Update"),
    inArr=op.inArray("array"),
    inWidth=op.inValueInt("width",32),
    inHeight=op.inValueInt("height",32),
    outNext=op.outTrigger("Next"),
    outTex=op.outTexture();

inExe.onTriggered=update;

const cgl=op.patch.cgl;
var tex=new CGL.Texture(cgl);

var arrayResized=true;
var pixels=new Uint8Array(8);

inWidth.onChange=inHeight.onChange=function()
{
    if(tex)tex.delete();
    tex=null;
    arrayResized=true;
};

const emptyTex=CGL.Texture.getEmptyTexture(cgl);

function update()
{
    var error=false;
    var w=inWidth.get();
    var h=inHeight.get();
    var data=inArr.get();

    if(w<=0 || h<=0 || !data) error=true;

    if(error)
    {
        outTex.set(emptyTex);
        return;
    }

    if(arrayResized)
    {
        pixels=new Uint8Array(w*h*4);
        arrayResized=false;
    }
    var i=0;

    for(i=0;i<data.length;i++)
    {
        pixels[i]=data[i];
    }
    for(i=data.length;i<w*h*4;i++)
    {
        pixels[i]=255;
    }

    if(!tex)tex=new CGL.Texture(cgl);

    tex.initFromData(pixels,w,h,CGL.Texture.FILTER_NEAREST,CGL.Texture.WRAP_REPEAT);

    outTex.set(tex);

    outNext.trigger();
}