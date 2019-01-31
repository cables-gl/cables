var inWidth=op.inValueInt("Width",256);
var inHeight=op.inValueInt("Height",256);
var inColor=op.inValueBool("Color",false);
var outTex=op.outTexture("Texture");

var cgl=op.patch.cgl;

inWidth.onChange=
    inHeight.onChange=
    inColor.onChange=update;

update();

function update()
{
    var width=Math.ceil(inWidth.get());
    var height=Math.ceil(inHeight.get());

    if(width<1)width=1;
    if(height<1)height=1;

    const num =width*4*height;
    const pixels=new Uint8Array(num);
    var i=0;

    if(inColor.get())
    {
        for(i=0;i<num;i+=4)
        {
            pixels[i+0]=Math.random()*255;
            pixels[i+1]=Math.random()*255;
            pixels[i+2]=Math.random()*255;
            pixels[i+3]=255;
        }
    }
    else
    {
        for(i=0;i<num;i+=4)
        {
            var c=Math.random()*255;
            pixels[i+0]=c;
            pixels[i+1]=c;
            pixels[i+2]=c;
            pixels[i+3]=255;
        }
    }

    var tex=new CGL.Texture(cgl,{wrap:CGL.Texture.WRAP_REPEAT});

    tex.initFromData(pixels,width,height);

    outTex.set(null);
    outTex.set(tex);
}
