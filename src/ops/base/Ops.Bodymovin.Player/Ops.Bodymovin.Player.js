op.name="bodymovin";

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));

var textureOut=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));

var canvasImage=null;
var cgl=op.patch.cgl;

var anim=null;
var ctx=null;
var canvas=null;


// texture size
// texture repeat...
// texture filter...


exe.onTriggered=function()
{
    if(!canvasImage || !canvas)return;

    if(textureOut.get()) textureOut.get().initTexture(cgl,canvasImage);
        else 
        {
            textureOut.set(new CGL.Texture.fromImage(cgl,canvasImage,CGL.Texture.FILTER_NEAREST,CGL.Texture.WRAP_REPEAT));
            
            textureOut.get().setSize(1270,720);
            
        }
};


filename.onValueChanged=function()
{
    if(anim)
    {
        anim.stop();
        // anim.destroy();
    }

    if(!canvasImage)
    {
        canvas = document.createElement('canvas');
        canvas.id     = "bodymovin_"+op.patch.config.glCanvasId+Date.now();
        canvas.width  = 1280;
        canvas.height = 720;
        canvas.style.display   = "none";
        // canvas.style['z-index']   = "99999";
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(canvas);
        
        canvasImage = document.getElementById(canvas.id);
        ctx = canvasImage.getContext('2d');
    }


    var animData= {
        animType: 'canvas',
        loop: true,
        prerender: true,
        autoplay: true,
        path: filename.get(),
        rendererSettings:
        {
            context: ctx,
            clearCanvas: true,
            scaleMode:'fit'
        }
    };
    anim = bodymovin.loadAnimation(animData);
    anim.play();

};
