op.name="bodymovin";

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));

var tfilter=op.addInPort(new Port(op,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));
var wrap=op.addInPort(new Port(op,"wrap",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['repeat','mirrored repeat','clamp to edge']}));
var flip=op.addInPort(new Port(op,"flip",OP_PORT_TYPE_VALUE,{display:'bool'}));

var width=op.addInPort(new Port(op,"texture width"));
var height=op.addInPort(new Port(op,"texture height"));

var bmScale=op.addInPort(new Port(op,"scale",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['fit','nofit']}));

var rewind=this.addInPort(new Port(this,"rewind",OP_PORT_TYPE_FUNCTION,{display:'button'}));
var speed=op.addInPort(new Port(op,"speed"));

var textureOut=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));

bmScale.set('fit');

tfilter.set('linear');
tfilter.onValueChanged=onFilterChange;
filename.onValueChanged=reload;

bmScale.onValueChanged=reloadForce;
width.onValueChanged=reloadForce;
height.onValueChanged=reloadForce;

var canvasImage=null;
var cgl=op.patch.cgl;

speed.set(1);

var anim=null;
var ctx=null;
var canvas=null;
var cgl_filter=CGL.Texture.FILTER_NEAREST;
var cgl_wrap=CGL.Texture.WRAP_REPEAT;
width.set(1280);
height.set(720);
var createTexture=false;


rewind.onTriggered=function()
{
    anim.goToAndPlay(0, true);  
};

speed.onValueChanged=function()
{
    if(anim) anim.setSpeed(speed.get());
};

flip.onValueChanged=function()
{
    createTexture=true;
};

wrap.onValueChanged=function()
{
    // console.log(wrap.get());
    if(wrap.get()=='repeat') cgl_wrap=CGL.Texture.WRAP_REPEAT;
    if(wrap.get()=='mirrored repeat') cgl_wrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    if(wrap.get()=='clamp to edge') cgl_wrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

    createTexture=true;
};

function onFilterChange()
{
    cgl_filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear') cgl_filter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap') cgl_filter=CGL.Texture.FILTER_MIPMAP;

    createTexture=true;
}

exe.onTriggered=function()
{
    if(!canvasImage || !canvas)return;

    if(!textureOut.get() || createTexture)
    {
        var texOpts=
        {
            wrap:cgl_wrap,
            filter:cgl_filter,
            flip:flip.get()
        };

        textureOut.set(new CGL.Texture.createFromImage(cgl,canvasImage,texOpts));
        createTexture=false;
    }
    else 
    {
        textureOut.get().initTexture(cgl,canvasImage);
    }

};


op.onDelete=function()
{
    console.log('delete bodymovin...');
    anim.stop();
    anim=null;
};

function reloadForce()
{
    createTexture=true;
    reload(true);
}

var canvasId="bodymovin_"+op.patch.config.glCanvasId+CABLES.generateUUID();

function reload(force)
{
    if(anim)
    {
        anim.stop();
    }

    if(!canvasImage || force)
    {
        console.log("create canvas...");
        if(canvas)
        {
            canvas.remove();
        }
        canvas = document.createElement('canvas');
        canvas.id     = canvasId;

        canvas.width  = width.get();
        canvas.height = height.get();

        console.log("canvas size",canvas.width,canvas.height);

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
            scaleMode:bmScale.get()
        }
    };
    anim = bodymovin.loadAnimation(animData);
    anim.setSpeed(speed.get());
    anim.play();

}
