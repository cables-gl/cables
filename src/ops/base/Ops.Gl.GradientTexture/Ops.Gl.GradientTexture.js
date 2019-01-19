const
    inGrad=op.inGradient("Gradient"),
    inSmoothstep=op.inValueBool("Smoothstep",true),
    inSize=op.inValueInt("Size",256),
    outTex=op.outTexture("Texture"),
    inDir=op.inValueSelect("Direction",["X","Y"],"X");


var cgl=op.patch.cgl;
inSize.onChange=inGrad.onChange=inSmoothstep.onChange=inDir.onChange=update;

inGrad.set('{"keys" : [{"pos":0,"r":0,"g":0,"b":0},{"pos":0.25,"r":0,"g":0,"b":0},{"pos":0.75,"r":1,"g":1,"b":1},{"pos":1,"r":1,"g":1,"b":1}]}');

console.log(inGrad.get());

function update()
{
    var width=Math.round(inSize.get());
    if(width<4)width=4;
    var grad=null;

    console.log(inGrad.get());

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

    if(!grad || !grad.keys)
    {
        console.error("gradient no data");
        return;
    }

    var keys=grad.keys;
    var pixels=new Uint8Array(width*4);

    for(var i=0;i<keys.length-1;i++)
    {
        var keyA=keys[i];
        var keyB=keys[i+1];

        for(var x=keyA.pos*width;x<keyB.pos*width;x++)
        {
            var p=CABLES.map(x,keyA.pos*width,keyB.pos*width,0,1);
            if(inSmoothstep.get())p=CABLES.smoothStep(p);
            x=Math.round(x);

            pixels[x*4+0]=Math.round(( (p*keyB.r)+ (1.0-p)*(keyA.r))*255);
            pixels[x*4+1]=Math.round(( (p*keyB.g)+ (1.0-p)*(keyA.g))*255);
            pixels[x*4+2]=Math.round(( (p*keyB.b)+ (1.0-p)*(keyA.b))*255);
            pixels[x*4+3]=Math.round(255);
        }
    }

    var tex=new CGL.Texture(cgl);

    if(inDir.get()=="X") tex.initFromData(pixels,width,1);
    if(inDir.get()=="Y") tex.initFromData(pixels,1,width);
    outTex.set(null);
    outTex.set(tex);
}