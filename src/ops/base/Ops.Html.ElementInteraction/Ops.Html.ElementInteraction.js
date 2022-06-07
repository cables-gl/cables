const
    inEle = op.inObject("Element"),
    inAct = op.inBool("Active", true),
    outIsDownLeft = op.outBool("Mouse Is Down Left"),
    outIsDownRight = op.outBool("Mouse Is Down Right"),
    outDownLeft = op.outTrigger("Mouse Down Left"),
    outDownRight = op.outTrigger("Mouse Down Right"),
    outUpLeft = op.outTrigger("Mouse Up Left"),
    outUpRight = op.outTrigger("Mouse Up Right"),
    outOver = op.outBool("Mouse Over"),
    outEnter = op.outTrigger("Mouse Enter"),
    outLeave = op.outTrigger("Mouse Leave"),
    outPosX = op.outNumber("Offset X"),
    outPosY = op.outNumber("Offset Y");

let ele = null;

inEle.onChange = () =>
{
    const el = inEle.get();

    if (el) addListeners(el);
    else removeListeners();
};

function addListeners(el)
{
    ele = el;

    ele.addEventListener("pointerenter", onEnter);
    ele.addEventListener("pointerleave", onLeave);
    ele.addEventListener("pointermove", onMove);
    ele.addEventListener("pointerdown", onDown);
    ele.addEventListener("pointerup", onUp);
    // ele.addEventListener("touchstart",onDown);
}

function removeListeners()
{
    if (!ele) return;
    ele.removeEventListener("pointerenter", onEnter);
    ele.removeEventListener("pointerleave", onLeave);
    ele.removeEventListener("pointermove", onMove);
    ele.removeEventListener("pointerdown", onDown);
    ele.removeEventListener("pointerup", onUp);
    // ele.removeEventListener("touchstart",onDown);
}

function onMove(e)
{
    outPosX.set(e.offsetX);
    outPosY.set(e.offsetY);
    outIsDownLeft.set(e.buttons == 1);
    outIsDownRight.set(e.buttons == 2);
}

function onDown(e)
{
    outPosX.set(e.offsetX);
    outPosY.set(e.offsetY);

    if (e.buttons == 1)outDownLeft.trigger();
    if (e.buttons == 2)outDownRight.trigger();

    ele.setPointerCapture(e.pointerId);

    outIsDownLeft.set(e.buttons == 1);
    outIsDownRight.set(e.buttons == 2);
}

function onUp(e)
{
    outPosX.set(e.offsetX);
    outPosY.set(e.offsetY);

    ele.releasePointerCapture(e.pointerId);

    if (e.buttons == 1)outUpLeft.trigger();
    if (e.buttons == 2)outUpRight.trigger();
    outIsDownRight.set(false);
    outIsDownLeft.set(false);
}

function onEnter()
{
    outEnter.trigger();
    outOver.set(true);
}

function onLeave()
{
    outLeave.trigger();
    outIsDownLeft.set(false);
    outOver.set(false);
}
