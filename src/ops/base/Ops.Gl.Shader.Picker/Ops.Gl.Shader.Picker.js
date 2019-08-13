op.render=op.inTrigger("render");

const useMouseCoords=op.inValueBool("Use Mouse Coordinates",true);

op.x=op.inValueFloat("x");
op.y=op.inValueFloat("y");
op.enabled=op.inValueBool("enabled");
op.enabled.set(true);

op.trigger=op.outTrigger("trigger");
var somethingPicked=op.outValue("Something Picked");

var cursor=this.inValueSelect("cursor",["","pointer","auto","default","crosshair","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help"]);

//inValueSelect
cursor.set('default');

var pixelRGB = new Uint8Array(4);
var fb=null;
var cgl=op.patch.cgl;
var lastReadPixel=0;
var canceledTouch=false;
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
        op.x.set(e.offsetX*(window.devicePixelRatio||1));
        op.y.set(e.offsetY*(window.devicePixelRatio||1));
    }
}

function updateListeners()
{
    cgl.canvas.removeEventListener('mouseleave', mouseleave);
    cgl.canvas.removeEventListener('mousemove', mouseMove);
    cgl.canvas.removeEventListener('touchmove', ontouchmove);
    cgl.canvas.removeEventListener('touchstart', ontouchstart);
    cgl.canvas.removeEventListener('touchend', ontouchend);
    cgl.canvas.removeEventListener('touchcancel', ontouchend);


    if(useMouseCoords.get())
    {
        cgl.canvas.addEventListener('mouseleave', mouseleave);
        cgl.canvas.addEventListener('mousemove', mouseMove);
        cgl.canvas.addEventListener('touchmove', ontouchmove);
        cgl.canvas.addEventListener('touchstart', ontouchstart);
        cgl.canvas.addEventListener('touchend', ontouchend);
        cgl.canvas.addEventListener('touchcancel', ontouchend);

    }
}

function fixTouchEvent(touchEvent)
{
    if(touchEvent)
    {
        touchEvent.offsetX = touchEvent.pageX - touchEvent.target.offsetLeft;
        touchEvent.offsetY = touchEvent.pageY - touchEvent.target.offsetTop;

        if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
        {
            touchEvent.offsetX*=(window.devicePixelRatio||1);
            touchEvent.offsetY*=(window.devicePixelRatio||1);
        }

        return touchEvent;
    }
}

function ontouchstart(event)
{
    canceledTouch=false;
    // console.log("touch START");
    if(event.touches && event.touches.length>0)
    {
        ontouchmove(event);
        // mouseMove(fixTouchEvent(event.touches[0]));
    }
}

function mouseleave(event)
{
    op.x.set(-1000);
    op.y.set(-1000);
}

function ontouchend(event)
{
    canceledTouch=true;
    op.x.set(-1000);
    op.y.set(-1000);
    // console.log("touch END");
}

function ontouchmove(event)
{
    // console.log("touchmove");

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

    if(op.enabled.get() && op.x.get()>=0 && !canceledTouch)
    {
        if(CABLES.now()-lastReadPixel>=50)
        {
            // console.log(op.x.get());

            var minimizeFB=2;
            cgl.resetViewPort();

            var vpW=Math.floor(cgl.canvasWidth/minimizeFB);
            var vpH=Math.floor(cgl.canvasHeight/minimizeFB);

            if(vpW!=fb.getWidth() || vpH!=fb.getHeight() )
            {
                tex.set( null);
                fb.setSize( vpW,vpH );
                tex.set( fb.getTextureColor() );
            }

            cgl.pushModelMatrix();
            fb.renderStart();
            // cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);

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
            cgl.popModelMatrix();
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
        cgl.frameStore.pickedColor=-1000;
        op.trigger.trigger();
        somethingPicked.set(false);
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
