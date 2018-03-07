var inGrad=op.inGradient("Gradient");
var outTex=op.outObject("Texture");

var cgl=op.patch.cgl;

inGrad.onChange=function()
{
    var width=255;
    var grad=null;

    if(!inGrad.get() || inGrad.get()=='')
    {
        console.error("gradient no data");
        return;
    }
    
    try
    {
        grad=JSON.parse(inGrad.get());
    }
    catch(e)
    {
        console.error("could not parse gradient data");
    }
    
    if(!grad.keys)
    {
        console.error("gradient no data");
        return;
    }
    
    var keys=grad.keys;


    var pixels=new Uint8Array(256*4);

    // pixels.length=256*4;
    
    for(var i=0;i<keys.length-1;i++)
    {
        var keyA=keys[i];
        var keyB=keys[i+1];
        
        for(var x=keyA.pos*width;x<keyB.pos*width;x++)
        {
            var p=CABLES.map(x,keyA.pos*width,keyB.pos*width,0,1);
            x=Math.round(x);

            pixels[x*4+0]=Math.round(( (p*keyB.r)+ (1.0-p)*(keyA.r))*255);
            pixels[x*4+1]=Math.round(( (p*keyB.g)+ (1.0-p)*(keyA.g))*255);
            pixels[x*4+2]=Math.round(( (p*keyB.b)+ (1.0-p)*(keyA.b))*255);
            pixels[x*4+3]=Math.round(255);
        }
    }

    var tex=new CGL.Texture(cgl);
    tex.initFromData(pixels,256,1);
    outTex.set(null);
    outTex.set(tex);
    

};