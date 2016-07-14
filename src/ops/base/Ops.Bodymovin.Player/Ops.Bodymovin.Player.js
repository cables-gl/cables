op.name="bodymovin";


var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));

var textureOut=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));

var cgl=op.patch.cgl;
var canvas = document.createElement('canvas');
canvas.id     = "bodymovin_"+op.patch.config.glCanvasId;
canvas.width  = 1920;
canvas.height = 1080;
canvas.style.display   = "none";
canvas.style['z-index']   = "99999";
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

var ccc = document.getElementById(canvas.id);
var ctx = ccc.getContext('2d');
ctx.fillText('hallo hallo hallo hallo hallo', 10, 35);


var anim=null;
exe.onTriggered=function()
{
    if(textureOut.get()) textureOut.get().initTexture(cgl,ccc);
        else textureOut.set( new CGL.Texture.fromImage(cgl,ccc) );
};

filename.onValueChanged=function()
{
    var animData= {
        animType: 'canvas',
        loop: true,
        prerender: true,
        autoplay: true,
        path: filename.get(),
        rendererSettings:
        {
            context: ctx,
            clearCanvas: true
        }
    //   scaleMode: 'noScale',
    };
    
    anim = bodymovin.loadAnimation(animData);

};
