CABLES.InertiaAnim = function (cb)
{
    this._inVelocity = 0;

    this._lastVal = 0;
    this._lastTime = 0;

    this.value = 0;
    this._cb = cb;

    this.INERTIA_SCROLL_FACTOR = 3.5;
    this.INERTIA_ACCELERATION = 0.95;
    this._firstTime = true;

    this.bounds = null;
};

CABLES.InertiaAnim.prototype.updateSmooth = function ()
{
    this.value += this._inVelocity * this.INERTIA_SCROLL_FACTOR;
    this._inVelocity *= this.INERTIA_ACCELERATION;

    // console.log(this.value);
    if (this._cb) this._cb(this.value);
    // console.log('.');

    if (Math.abs(this._inVelocity) < 0.1)
    {
        clearInterval(this._smoothInterval);
        this._inVelocity = 0;
    }
};

CABLES.InertiaAnim.prototype.get = function ()
{
    return this.value;
};

CABLES.InertiaAnim.prototype.release = function ()
{
    clearInterval(this._smoothInterval);
    this._smoothInterval = setInterval(this.updateSmooth.bind(this), 16.7);
    this._firstTime = true;
};

CABLES.InertiaAnim.prototype.set = function (_value)
{
    if (this._firstTime)
    {
        clearInterval(this._smoothInterval);
        this.value = _value;
        this._lastTime = CABLES.now();
        this._firstTime = false;
    }

    let dist = (_value - this.value);
    // console.log('dist',dist,_value);
    this._inVelocity = dist / (CABLES.now() - this._lastTime + 0.0000001);

    this.value = _value;
    if (this._cb) this._cb(this.value);

    // console.log('this._inVelocity ',this._inVelocity);
    this._lastTime = CABLES.now();
};

// ---------------

let canvas = op.patch.cgl.canvas;

let outX = op.addOutPort(new CABLES.Port(op, "x"));
let outY = op.addOutPort(new CABLES.Port(op, "y"));
let flipY = op.inValueBool("Flip Y", true);
let kinetic = op.inValueBool("Inertia Movement", true);
let limit = op.inValueBool("Limit");

let doReset = op.inTriggerButton("Reset");

let mul = op.inValue("mul", 0.1);

let minX = op.inValue("minX", -600);
let maxX = op.inValue("maxX", 600);
let minY = op.inValue("minY", -600);
let maxY = op.inValue("maxY", 600);

let active = op.inValueBool("Active", true);

let isMoving = op.outValue("isMoving");
let isPressed = op.outValue("isPressed");

let cgl = op.patch.cgl;

outY.ignoreValueSerialize = true;
outX.ignoreValueSerialize = true;

let pressed = false;

let lastY = -1;
let lastX = -1;

outX.set(0);
outY.set(0);

let animX = new CABLES.InertiaAnim(updateKineticX);
let animY = new CABLES.InertiaAnim(updateKineticY);

doReset.onTriggered = function ()
{
    lastY = -1;
    lastX = -1;

    outX.set(0);
    outY.set(0);

    if (kinetic.get())
    {
        animX.set(0);
        animY.set(0);
    }
};

function updateKineticX(v)
{
    if (limit.get())
    {
        if (v > maxX.get())v = maxX.get();
        if (v < minX.get())v = minX.get();
    }

    outX.set(v * mul.get());
}

function updateKineticY(v)
{
    if (limit.get())
    {
        if (v > maxY.get())v = maxY.get();
        if (v < minY.get())v = minY.get();
    }

    outY.set(v * mul.get());
}

function onmouseclick()
{

}

let movingTimeout = 0;
function seMoving()
{
    isMoving.set(true);
    clearTimeout(movingTimeout);
    movingTimeout = setTimeout(
        function ()
        {
            isMoving.set(false);
        }, 60);
}

function onmousemove(e)
{
    let clientY = e.clientY;
    if (flipY.get()) clientY = cgl.canvas.clientHeight - clientY;

    if (pressed)
    {
        seMoving();

        if (lastX != -1)
        {
            if (kinetic.get())
            {
                let deltaX = (e.clientX - lastX);
                let deltaY = (clientY - lastY);

                var x = (animX.get() + deltaX);
                var y = (animY.get() + deltaY);

                if (x != x)x = 0;
                x = x || 0;

                if (y != y)y = 0;
                y = y || 0;

                if (x > maxX.get())x = maxX.get();
                if (x < minX.get())x = minX.get();
                if (y < minY.get())y = minY.get();
                if (y > maxY.get())y = maxY.get();

                animX.set(x);
                animY.set(y);
            }
            else
            {
                var x = (outX.get() + (e.clientX - lastX));
                var y = (outY.get() + (clientY - lastY));

                if (x != x)x = 0;
                x = x || 0;

                if (y != y)y = 0;
                y = y || 0;

                if (x < minX.get())x = minX.get();
                if (x > maxX.get())x = maxX.get();
                if (y < minY.get())y = minY.get();
                if (y > maxY.get())y = maxY.get();

                outX.set(x);
                outY.set(y);
            }
        }

        lastY = clientY;
        lastX = e.clientX;
    }
}

function onMouseLeave(e)
{
    onMouseUp(e);
    isPressed.set(false);
}

function onMouseDown(e)
{
    pressed = true;
    isPressed.set(true);
}

function onMouseUp(e)
{
    if (kinetic.get())
    {
        animX.release();
        animY.release();
    }

    isPressed.set(false);
    lastX = -1;
    lastY = -1;
    pressed = false;
}

function onMouseEnter()
{

}

function ontouchstart(event)
{
    pressed = true;
    isPressed.set(true);
    // console.log('touchmove',event);
    if (event.touches && event.touches.length > 0) onmousemove(event.touches[0]);
}

function bind()
{
    canvas.addEventListener("click", onmouseclick);
    canvas.addEventListener("mousemove", onmousemove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseenter", onMouseEnter);
    canvas.addEventListener("mouseleave", onMouseLeave);

    canvas.addEventListener("touchmove", ontouchstart);
    canvas.addEventListener("touchend", onMouseUp);
    canvas.addEventListener("touchstart", ontouchstart);
}

function unbind()
{
    // console.log("remove mouse op...");
    canvas.removeEventListener("click", onmouseclick);
    canvas.removeEventListener("mousemove", onmousemove);
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("mouseenter", onMouseEnter);
    canvas.removeEventListener("mouseleave", onMouseLeave);

    canvas.removeEventListener("touchmove", ontouchstart);
    canvas.removeEventListener("touchend", onMouseUp);
    canvas.removeEventListener("touchstart", ontouchstart);
}

active.onChange = function ()
{
    if (active.get())bind();
    else unbind();
};

bind();

op.onDelete = function ()
{
    unbind();
};
