op.name = "ArcBall";

let render = op.inTrigger("render");

let mulRotate = op.addInPort(new CABLES.Port(op, "Mul Rotate", CABLES.OP_PORT_TYPE_VALUE));
let mulScale = op.addInPort(new CABLES.Port(op, "Mul Scale", CABLES.OP_PORT_TYPE_VALUE));

let minScale = op.addInPort(new CABLES.Port(op, "Min Scale", CABLES.OP_PORT_TYPE_VALUE));
let maxScale = op.addInPort(new CABLES.Port(op, "Max Scale", CABLES.OP_PORT_TYPE_VALUE));

let useWheel = op.inValueBool("Use Mouse Wheel", true);

let inRadius = op.inValue("Radius", 1);

let trigger = op.outTrigger("trigger");

mulRotate.set(1);
mulScale.set(1);
minScale.set(0.1);
maxScale.set(1.5);

let cgl = op.patch.cgl;
let vScale = vec3.create();
let mouseDown = false;
let radius = 1.0;

let startX = -1;
let startY = -1;
let lastMouseX = -1;
let lastMouseY = -1;

let finalRotMatrix = mat4.create();

inRadius.onChange = function ()
{
    radius = inRadius.get() || 1;
};

render.onTriggered = function ()
{
    cgl.pushViewMatrix();
    // cgl.pushModelMatrix();

    if (inRadius.get() === 0)
    {
        if (radius < minScale.get()) radius = minScale.get();
        if (radius > maxScale.get()) radius = maxScale.get();
    }

    let r = radius;
    vec3.set(vScale, r, r, r);
    mat4.scale(cgl.vMatrix, cgl.vMatrix, vScale);
    // mat4.translate(cgl.vMatrix,cgl.vMatrix, vScale);

    mat4.multiply(cgl.vMatrix, cgl.vMatrix, finalRotMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
    // cgl.popModelMatrix();
};

function touchToMouse(event)
{
    event.offsetX = event.pageX - event.target.offsetLeft;
    event.offsetY = event.pageY - event.target.offsetTop;
    event.which = 1;

    if (startX == -1 && startY == -1 && event.offsetX == event.offsetX && event.offsetY == event.offsetY)
    {
        lastMouseX = startX = event.offsetX;
        lastMouseY = startY = event.offsetY;
    }

    if (event.offsetX != event.offsetX)event.offsetX = 0;
    if (event.offsetY != event.offsetY)event.offsetY = 0;

    return event;
}

function onTouchMove(event)
{
    // console.log(event);

    for (let i = 0; i < event.touches.length; i++)
    {
        let e = touchToMouse(event.touches[i]);

        if (e.offsetX == e.offsetX && e.offsetY == e.offsetY)
            onmousemove(e);
        // console.log(e);
    }
    event.preventDefault();
    // onmousemove('event',event);
}

function onmousemove(event)
{
    if (!mouseDown) return;

    if (lastMouseX == -1 && lastMouseY == -1) return;

    let x = event.offsetX;
    let y = event.offsetY;

    if (event.which == 3)
    {
        // vOffset[2]+=(x-lastMouseX)*0.01*mulTrans.get();
        // vOffset[1]+=(y-lastMouseY)*0.01*mulTrans.get();
    }

    if (inRadius.get() === 0)
    {
        if (event.which == 2)
        {
            radius -= (y - lastMouseY) * 0.001 * mulScale.get();
        }
    }

    if (event.which == 1)
    {
        let deltaX = x - lastMouseX;

        let newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix, newRotationMatrix, CGL.DEG2RAD * (deltaX / 10) * mulRotate.get(), [0, 1, 0]);

        let deltaY = y - lastMouseY;
        mat4.rotate(newRotationMatrix, newRotationMatrix, CGL.DEG2RAD * (deltaY / 10) * mulRotate.get(), [1, 0, 0]);

        mat4.multiply(finalRotMatrix, newRotationMatrix, finalRotMatrix);

        lastMouseX = x;
        lastMouseY = y;
    }

    lastMouseX = x;
    lastMouseY = y;
}

function onMouseDown(event)
{
    startX = event.offsetX;
    startY = event.offsetY;

    lastMouseX = event.offsetX;
    lastMouseY = event.offsetY;

    mouseDown = true;
}

function onMouseUp(event)
{
    mouseDown = false;
}

function onMouseEnter(event)
{
}

let onMouseWheel = function (event)
{
    if (useWheel.get())
    {
        let delta = CGL.getWheelSpeed(event) * 0.001;
        radius += (parseFloat(delta) * mulScale.get());
        event.preventDefault();
    }
};

function touchStart(event)
{
    mouseDown = true;
    event.preventDefault();
}

function touchEnd(event)
{
    mouseDown = false;
    startX = -1;
    startY = -1;
    event.preventDefault();
}

cgl.canvas.addEventListener("touchmove", onTouchMove);
cgl.canvas.addEventListener("touchstart", touchStart);
cgl.canvas.addEventListener("touchend", touchEnd);

cgl.canvas.addEventListener("mousemove", onmousemove);
cgl.canvas.addEventListener("mousedown", onMouseDown);
cgl.canvas.addEventListener("mouseup", onMouseUp);
cgl.canvas.addEventListener("mouseleave", onMouseUp);
cgl.canvas.addEventListener("mouseenter", onMouseEnter);
cgl.canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
cgl.canvas.addEventListener("wheel", onMouseWheel);

op.onDelete = function ()
{
    cgl.canvas.removeEventListener("touchmove", onTouchMove);
    cgl.canvas.removeEventListener("touchstart", touchStart);
    cgl.canvas.removeEventListener("touchend", touchEnd);

    cgl.canvas.removeEventListener("mousemove", onmousemove);
    cgl.canvas.removeEventListener("mousedown", onMouseDown);
    cgl.canvas.removeEventListener("mouseup", onMouseUp);
    cgl.canvas.removeEventListener("mouseleave", onMouseUp);
    cgl.canvas.removeEventListener("mouseenter", onMouseUp);
    cgl.canvas.removeEventListener("wheel", onMouseWheel);
    cgl.canvas.style.cursor = "auto";
};
