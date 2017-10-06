op.name='Picker';
op.render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var useMouseCoords=op.inValueBool("Use Mouse Coordinates",true);

op.x=op.addInPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
op.y=op.addInPort(new Port(op,"y",OP_PORT_TYPE_VALUE));
op.enabled=op.addInPort(new Port(op,"enabled",OP_PORT_TYPE_VALUE,{display:'bool'}));
op.enabled.set(true);

op.trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var somethingPicked=op.outValue("Something Picked");

var cursor=this.addInPort(new Port(this,"cursor",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["","pointer","auto","default","crosshair","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help"]} ));
cursor.set('default');

var pixelRGB = new Uint8Array(4);
var fb=null;
var cgl=op.patch.cgl;
var lastReadPixel=0;

if(cgl.glVersion==1) fb=new CGL.Framebuffer(cgl,4,4);
else
{
    // console.log("new framebuffer...");
    fb=new CGL.Framebuffer2(cgl,4,4,{multisampling:false});
}

var tex=op.outTexture("pick texture");
tex.set( fb.getTextureColor() );
useMouseCoords.onChange=updateListeners;
updateListeners();

function renderPickingPass()
{
    cgl.frameStore.renderOffscreen=true;
    cgl.frameStore.pickingpass=true;
    cgl.frameStore.pickingpassNum=0;
    op.trigger.trigger();
    cgl.frameStore.pickingpass=false;
    cgl.frameStore.renderOffscreen=false;
}

function mouseMove(e)
{
    if(e && e.hasOwnProperty('offsetX')>=0)
    {
        op.x.set(e.offsetX);
        op.y.set(e.offsetY);
    }
}

function updateListeners()
{
    cgl.canvas.removeEventListener('mouseleave', ontouchend);
    cgl.canvas.removeEventListener('mousemove', mouseMove);
    cgl.canvas.removeEventListener('touchmove', ontouchmove);
    cgl.canvas.removeEventListener('touchstart', ontouchstart);
    cgl.canvas.removeEventListener('touchend', ontouchend);

    if(useMouseCoords.get())
    {
        cgl.canvas.addEventListener('mouseleave', ontouchend);
        cgl.canvas.addEventListener('mousemove', mouseMove);
        cgl.canvas.addEventListener('touchmove', ontouchmove);
        cgl.canvas.addEventListener('touchstart', ontouchstart);
        cgl.canvas.addEventListener('touchend', ontouchend);
    }
}

function fixTouchEvent(touchEvent)
{
    if(touchEvent)
    {
        touchEvent.offsetX = touchEvent.pageX - touchEvent.target.offsetLeft;
        touchEvent.offsetY = touchEvent.pageY - touchEvent.target.offsetTop;

        return touchEvent;
    }
}

function ontouchstart(event)
{
    if(event.touches && event.touches.length>0) mouseMove(fixTouchEvent(event.touches[0]));
}

function ontouchend(event)
{
    op.x.set(-1000);
    op.y.set(-1000);
}

function ontouchmove(event)
{
    if(event.touches && event.touches.length>0)
    {
        mouseMove(fixTouchEvent(event.touches[0]));
    }
}


var doRender=function()
{
    if(cursor.get()!=cgl.canvas.style.cursor)
    {
        cgl.canvas.style.cursor=cursor.get();
    }

    if(op.enabled.get() && op.x.get()>=0)
    {
        if(CABLES.now()-lastReadPixel>=50)
        {
            var minimizeFB=2;
            cgl.resetViewPort();

            var vpW=Math.floor(cgl.canvas.width/minimizeFB);
            var vpH=Math.floor(cgl.canvas.height/minimizeFB);
            if(vpW!=fb.getWidth() || vpH!=fb.getHeight() )
            {
                fb.setSize( vpW,vpH );
            }

            cgl.pushMvMatrix();
            fb.renderStart();
            cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);

            renderPickingPass();

            var x=Math.floor(op.x.get()/minimizeFB);
            var y=Math.floor( vpH-op.y.get()/minimizeFB);
            if(x<0)x=0;
            if(y<0)y=0;

            // console.log('',x,y,vpW,vpH);
            // if(CABLES.now()-lastReadPixel>=50)
            {
                cgl.gl.readPixels(x,y, 1,1,  cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE ,pixelRGB);
                lastReadPixel=CABLES.now();
            }
            // cgl.gl.readPixels(op.x.get(), op.y.get(), 1,1,  cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE ,pixelRGB);

            fb.renderEnd();
            cgl.popMvMatrix();
            //   console.log(cgl.getViewPort()[2],cgl.getViewPort()[3],op.x.get(), op.y.get(),pixelRGB[0]);

            // cgl.gl.enable(cgl.gl.SCISSOR_TEST);
        }

        // cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);

        cgl.frameStore.pickedColor=pixelRGB[0];
        // console.log(cgl.frameStore.pickedColor);

        if(cgl.frameStore.pickedColor)somethingPicked.set(true);
        else somethingPicked.set(false);

        cgl.frameStore.pickingpassNum=0;
        op.trigger.trigger();
    }
    else
    {
        op.trigger.trigger();
    }

};

function preview()
{
    render();
    tex.val.preview();
}

tex.onPreviewChanged=function()
{
    if(tex.showPreview) op.render.onTriggered=doRender;
    else op.render.onTriggered=doRender;
};


op.render.onTriggered=doRender;
