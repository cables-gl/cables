const
    canvasOnly = op.inValueBool("canvas only", true),
    keysCursor = op.inValueBool("Cursor Keys", true),
    keysWasd = op.inValueBool("WASD", true),
    inActive = op.inBool("Active", true),
    outDeg = op.outNumber("Degree"),
    pressedUp = op.outBoolNum("Up"),
    triggerUp = op.outTrigger("Up Pressed"),
    pressedDown = op.outBoolNum("Down"),
    triggerDown = op.outTrigger("Down Pressed"),
    pressedLeft = op.outBoolNum("Left"),
    triggerLeft = op.outTrigger("Left Pressed"),
    pressedRight = op.outBoolNum("Right"),
    triggerRight = op.outTrigger("Right Pressed"),
    outPressed = op.outNumber("Any Button Pressed");

const cgl = op.patch.cgl;

function onKeyDown(e)
{
    if (keysWasd.get())
    {
        if (e.keyCode == 87)
        {
            pressedUp.set(true);
            triggerUp.trigger();
        }
        if (e.keyCode == 83)
        {
            pressedDown.set(true);
            triggerDown.trigger();
        }
        if (e.keyCode == 65)
        {
            pressedLeft.set(true);
            triggerLeft.trigger();
        }
        if (e.keyCode == 68)
        {
            pressedRight.set(true);
            triggerRight.trigger();
        }
    }
    if (keysCursor.get())
    {
        if (e.keyCode == 38)
        {
            pressedUp.set(true);
            triggerUp.trigger();
        }
        if (e.keyCode == 40)
        {
            pressedDown.set(true);
            triggerDown.trigger();
        }
        if (e.keyCode == 37)
        {
            pressedLeft.set(true);
            triggerLeft.trigger();
        }
        if (e.keyCode == 39)
        {
            pressedRight.set(true);
            triggerRight.trigger();
        }
    }

    setDegrees();
    outPressed.set(pressedUp.get() || pressedDown.get() || pressedLeft.get() || pressedRight.get());
}

function setDegrees()
{
    let deg = 0;

    if (pressedUp.get())deg = 360;
    if (pressedRight.get())deg = 90;
    if (pressedDown.get())deg = 180;
    if (pressedLeft.get())deg = 270;

    if (pressedUp.get() && pressedRight.get())deg = 360 + 45;
    if (pressedDown.get() && pressedRight.get())deg = 90 + 45;
    if (pressedDown.get() && pressedLeft.get())deg = 180 + 45;
    if (pressedUp.get() && pressedLeft.get())deg = 270 + 45;

    outDeg.set(deg);
}

function onKeyUp(e)
{
    if (keysWasd.get())
    {
        if (e.keyCode == 87)
        {
            pressedUp.set(false);
            triggerUp.trigger();
        }
        if (e.keyCode == 83)
        {
            pressedDown.set(false);
            triggerDown.trigger();
        }
        if (e.keyCode == 65)
        {
            pressedLeft.set(false);
            triggerLeft.trigger();
        }
        if (e.keyCode == 68)
        {
            pressedRight.set(false);
            triggerRight.trigger();
        }
    }
    if (keysCursor.get())
    {
        if (e.keyCode == 38)
        {
            pressedUp.set(false);
            triggerUp.trigger();
        }
        if (e.keyCode == 40)
        {
            pressedDown.set(false);
            triggerDown.trigger();
        }
        if (e.keyCode == 37)
        {
            pressedLeft.set(false);
            triggerLeft.trigger();
        }
        if (e.keyCode == 39)
        {
            pressedRight.set(false);
            triggerRight.trigger();
        }
    }

    setDegrees();
    outPressed.set(pressedUp.get() || pressedDown.get() || pressedLeft.get() || pressedRight.get());
}

op.onDelete = function ()
{
    cgl.canvas.removeEventListener("keyup", onKeyUp, false);
    cgl.canvas.removeEventListener("keydown", onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    document.removeEventListener("keydown", onKeyDown, false);
};

function addListeners()
{
    if (canvasOnly.get()) addCanvasListener();
    else addDocumentListener();
}

function onBlur()
{
    pressedUp.set(false);
    pressedDown.set(false);
    pressedLeft.set(false);
    pressedRight.set(false);
}

inActive.onChange = () =>
{
    pressedUp.set(false);
    pressedDown.set(false);
    pressedLeft.set(false);
    pressedRight.set(false);

    removeListeners();
    if (inActive.get())addListeners();
};

function removeListeners()
{
    cgl.canvas.removeEventListener("blur", onBlur);
    document.removeEventListener("keydown", onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    cgl.canvas.removeEventListener("keydown", onKeyDown, false);
    cgl.canvas.removeEventListener("keyup", onKeyUp, false);
}

function addCanvasListener()
{
    cgl.canvas.addEventListener("blur", onBlur);

    cgl.canvas.addEventListener("keydown", onKeyDown, false);
    cgl.canvas.addEventListener("keyup", onKeyUp, false);
}

function addDocumentListener()
{
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
}

canvasOnly.onChange = function ()
{
    removeListeners();
    addListeners();
};

canvasOnly.set(true);
addCanvasListener();
