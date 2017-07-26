op.name="TextureColorPickArray";

var pUpdate=op.inFunction("update");
var tex=op.inObject("texture");
var numX=op.inValue("Num X",5);
var numY=op.inValue("Num Y",5);
var outColors=op.outArray("Colors");

pUpdate.onTriggered=update;

var cgl=op.patch.cgl;

var fb=null;
var texChanged=false;

tex.onChange=function()
{
    texChanged=true;
    
};

var colors=[];

function update()
{
    if(!tex.get())return;
    
    if(!fb)
    {
        fb = cgl.gl.createFramebuffer();
    }

    cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, fb);

    if(texChanged)
    {
        cgl.gl.framebufferTexture2D(
            cgl.gl.FRAMEBUFFER, cgl.gl.COLOR_ATTACHMENT0,
            cgl.gl.TEXTURE_2D, tex.get().tex, 0);
        texChanged=false;
    }

    var canRead = true;//(cgl.gl.checkFramebufferStatus(cgl.gl.FRAMEBUFFER) == cgl.gl.FRAMEBUFFER_COMPLETE);
    
    
    if (canRead)
    {
        cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, fb);

        var pixelData = new Uint8Array(4);
        
        var xx=numX.get();
        var yy=numY.get();
        
        colors.length=Math.floor(xx*yy);
        var count=0;

        for(var x=0;x<1;x+=1/xx)
        {
            for(var y=0;y<1;y+=1/yy)
            {
                cgl.gl.readPixels(
                    Math.floor(x*tex.get().width),
                    Math.floor(y*tex.get().height),1,1, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, pixelData);        

                colors[count+0]=(pixelData[0]/255);
                colors[count+1]=(pixelData[1]/255);
                colors[count+2]=(pixelData[2]/255);
                colors[count+3]=(pixelData[3]/255);
                
                count+=4;
            }
        }

        cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);
        outColors.set(null);
        outColors.set(colors);
    }
    else
    {
        console.log("CANONT READ");
    }



    cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);
}