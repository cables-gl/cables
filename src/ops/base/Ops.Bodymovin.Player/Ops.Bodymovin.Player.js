op.name="bodymovin";

var exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var filename=op.addInPort(new Port(op,"file",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));

var play=op.addInPort(new Port(op,"play",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' } ));



var tfilter=op.addInPort(new Port(op,"filter",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));
var wrap=op.addInPort(new Port(op,"wrap",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['repeat','mirrored repeat','clamp to edge']}));
var flip=op.addInPort(new Port(op,"flip",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));

var width=op.addInPort(new Port(op,"texture width"));
var height=op.addInPort(new Port(op,"texture height"));

var bmScale=op.addInPort(new Port(op,"scale",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['fit','nofit']}));

var rewind=op.addInPort(new Port(op,"rewind",CABLES.OP_PORT_TYPE_FUNCTION,{display:'button'}));
var speed=op.addInPort(new Port(op,"speed"));
var frame=op.addInPort(new Port(op,"frame"));

var textureOut=op.outTexture("texture");

var canvasId="bodymovin_"+CABLES.generateUUID();

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


play.onValueChanged=function()
{
    if(play.get()) 
    {
        anim.play();
        // updateTexture();
    }
    else anim.pause();
};


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
    // op.log(wrap.get());
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



var lastFrame=-2;
exe.onTriggered=function()
{
    if(!canvasImage || !canvas)return;

    if(lastFrame!=frame.get()) 
    {
        lastFrame=frame.get();
        if(frame.get()!=-1.0)
        {
            anim.goToAndStop(frame.get(),true);
        }

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
            textureOut.get().initTexture(canvasImage);
        }
    }

};


op.onDelete=function()
{
    op.log('delete bodymovin...');
    if(anim)anim.stop();
    anim=null;
};



function reloadForce()
{
    createTexture=true;
    reload(true);
}


function reload(force)
{
    if(anim)
    {
        anim.stop();
    }

    if(!canvasImage || force)
    {
        op.log("create canvas...");
        if(canvas)
        {
            canvas.remove();
        }
        canvas = document.createElement('canvas');
        canvas.id     = canvasId;
        op.log('canvasId',canvasId);

        canvas.width  = width.get();
        canvas.height = height.get();

        op.log("canvas size",canvas.width,canvas.height);

        canvas.style.display   = "none";
        // canvas.style['z-index']   = "99999";
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(canvas);
        
        canvasImage = document.getElementById(canvas.id);
        ctx = canvasImage.getContext('2d');
    }

    var animData= {
        animType: 'canvas',
        loop: false,
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
