op.render = op.inTrigger("render");

const useMouseCoords = op.inBool("Use Mouse Coordinates", true);

op.x = op.inFloat("x");
op.y = op.inFloat("y");
const inEnabled = op.inBool("enabled");
inEnabled.set(true);

op.trigger = op.outTrigger("trigger");
const somethingPicked = op.outBool("Something Picked");

const cursor = op.inDropDown("cursor", ["", "pointer", "auto", "default", "crosshair", "move", "n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize", "text", "wait", "help"]);

// inValueSelect
cursor.set("default");

const pixelRGB = new Uint8Array(4);
let fb = null;
const cgl = op.patch.cgl;
let lastReadPixel = 0;
let canceledTouch = false;
if (cgl.glVersion == 1) fb = new CGL.Framebuffer(cgl, 4, 4);
else
{
    fb = new CGL.Framebuffer2(cgl, 4, 4, { "multisampling": false });
}

const tex = op.outTexture("pick texture");
tex.set(fb.getTextureColor());
useMouseCoords.onChange = updateListeners;
updateListeners();

function renderPickingPass()
{
    cglframeStorerenderOffscreen = true;
    cglframeStorepickingpass = true;
    cglframeStorepickingpassNum = 0;
    op.trigger.trigger();
    cglframeStorepickingpass = false;
    cglframeStorerenderOffscreen = false;
}

function mouseMove(e)
{
    if (e && e.hasOwnProperty("offsetX") >= 0)
    {
        op.x.set(e.offsetX * (window.devicePixelRatio || 1));
        op.y.set(e.offsetY * (window.devicePixelRatio || 1));
    }
}

function updateListeners()
{
    cgl.canvas.removeEventListener("mouseleave", mouseleave);
    cgl.canvas.removeEventListener("mousemove", mouseMove);
    cgl.canvas.removeEventListener("touchmove", ontouchmove);
    cgl.canvas.removeEventListener("touchstart", ontouchstart);
    cgl.canvas.removeEventListener("touchend", ontouchend);
    cgl.canvas.removeEventListener("touchcancel", ontouchend);

    if (useMouseCoords.get())
    {
        cgl.canvas.addEventListener("mouseleave", mouseleave);
        cgl.canvas.addEventListener("mousemove", mouseMove);
        cgl.canvas.addEventListener("touchmove", ontouchmove);
        cgl.canvas.addEventListener("touchstart", ontouchstart);
        cgl.canvas.addEventListener("touchend", ontouchend);
        cgl.canvas.addEventListener("touchcancel", ontouchend);
    }
}

function fixTouchEvent(touchEvent)
{
    if (touchEvent)
    {
        touchEvent.offsetX = touchEvent.pageX - touchEvent.target.offsetLeft;
        touchEvent.offsetY = touchEvent.pageY - touchEvent.target.offsetTop;

        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        {
            touchEvent.offsetX *= (window.devicePixelRatio || 1);
            touchEvent.offsetY *= (window.devicePixelRatio || 1);
        }

        return touchEvent;
    }
}

function ontouchstart(event)
{
    canceledTouch = false;
    if (event.touches && event.touches.length > 0)
    {
        ontouchmove(event);
    }
}

function mouseleave(event)
{
    op.x.set(-1000);
    op.y.set(-1000);
}

function ontouchend(event)
{
    canceledTouch = true;
    op.x.set(-1000);
    op.y.set(-1000);
}

function ontouchmove(event)
{
    if (event.touches && event.touches.length > 0)
    {
        mouseMove(fixTouchEvent(event.touches[0]));
    }
}

const doRender = function ()
{
    if (cursor.get() != cgl.canvas.style.cursor)
    {
        cgl.canvas.style.cursor = cursor.get();
    }

    if (inEnabled.get() && op.x.get() >= 0 && !canceledTouch)
    {
        if (CABLES.now() - lastReadPixel >= 50)
        {
            const minimizeFB = 2;
            cgl.resetViewPort();

            const vpW = Math.floor(cgl.canvasWidth / minimizeFB);
            const vpH = Math.floor(cgl.canvasHeight / minimizeFB);

            if (vpW != fb.getWidth() || vpH != fb.getHeight())
            {
                tex.set(null);
                fb.setSize(vpW, vpH);
                tex.set(fb.getTextureColor());
            }

            cgl.pushModelMatrix();
            fb.renderStart();
            // cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);

            renderPickingPass();

            let x = Math.floor(op.x.get() / minimizeFB);
            let y = Math.floor(vpH - op.y.get() / minimizeFB);
            if (x < 0)x = 0;
            if (y < 0)y = 0;

            cgl.gl.readPixels(x, y, 1, 1, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, pixelRGB);
            lastReadPixel = CABLES.now();

            fb.renderEnd();
            cgl.popModelMatrix();
        }

        cglframeStorepickedColor = pixelRGB[0] + pixelRGB[2];

        if (cglframeStorepickedColor)somethingPicked.set(true);
        else somethingPicked.set(false);

        cglframeStorepickingpassNum = 0;
        op.trigger.trigger();
    }
    else
    {
        cglframeStorepickedColor = -1000;
        op.trigger.trigger();
        somethingPicked.set(false);
    }
};

function preview()
{
    render();
    tex.get().preview();
}

// tex.onPreviewChanged = function ()
// {
//     if (tex.showPreview) op.render.onTriggered = doRender;
//     else op.render.onTriggered = doRender;
// };

op.render.onTriggered = doRender;
