const
    inCoords = op.inSwitch("Coordinates", ["-1 to 1", "Pixel Display", "Pixel", "0 to 1"], "-1 to 1"),
    area = op.inValueSelect("Area", ["Canvas", "Document", "Parent Element", "Canvas Area"], "Canvas"),
    flipY = op.inValueBool("flip y", true),
    inEventType = op.inSwitch("Events", ["Pointer", "Mouse", "Touch"], "Pointer"),
    inPassive = op.inValueBool("Passive Events", false),
    active = op.inValueBool("Active", true),
    inPreventDefault = op.inValueBool("Prevent Default", false),
    inEle = op.inObject("Element", null, "element"),
    outMouseX = op.outNumber("x", 0),
    outMouseY = op.outNumber("y", 0),
    mouseClick = op.outTrigger("click"),
    mouseClickRight = op.outTrigger("click right"),
    mouseDown = op.outBoolNum("Button is down"),
    mouseOver = op.outBoolNum("Mouse is hovering"),
    outMovementX = op.outNumber("Movement X", 0),
    outMovementY = op.outNumber("Movement Y", 0),
    outIsPrimary = op.outBoolNum("Is Primary", 0),
    outEvent = op.outObject("Event"),
    outMoved = op.outTrigger("Moved");

const cgl = op.patch.cgl;
let normalize = 1;
let listenerElement = null;
let sizeElement = null;
let startTimeDown = 0;

inPassive.onChange =
area.onChange = addListeners;

inCoords.onChange = updateCoordNormalizing;
op.onDelete = removeListeners;

addListeners();

op.on("loadedValueSet", onStart);

inEle.onChange =
inEle.onLinkChanged = () =>
{
    removeListeners();
    addListeners();

    area.setUiAttribs({ "greyout": inEle.isLinked() });
};

function onStart()
{
    if (normalize == 0)
    {
        if (sizeElement.clientWidth === 0) setTimeout(onStart, 50);

        outMouseX.set(sizeElement.clientWidth / 2);
        outMouseY.set(sizeElement.clientHeight / 2);
    }
    else if (normalize == 1)
    {
        outMouseX.set(0);
        outMouseY.set(0);
    }
    else if (normalize == 2)
    {
        outMouseX.set(0.5);
        outMouseY.set(0.5);
    }
    else if (normalize == 3)
    {
        if (sizeElement.clientWidth === 0)
        {
            setTimeout(onStart, 50);
        }

        outMouseX.set(sizeElement.clientWidth / 2 / cgl.pixelDensity);
        outMouseY.set(sizeElement.clientHeight / 2 / cgl.pixelDensity);
    }
    else console.error("unknown normalize mouse", normalize);
}

function setValue(x, y)
{
    x = x || 0;
    y = y || 0;

    if (normalize == 0) // pixel
    {
        outMouseX.set(x);
        outMouseY.set(y);
    }
    else
    if (normalize == 3) // pixel css
    {
        outMouseX.set(x * cgl.pixelDensity);
        outMouseY.set(y * cgl.pixelDensity);
    }
    else
    {
        let w = sizeElement.clientWidth / cgl.pixelDensity;
        let h = sizeElement.clientHeight / cgl.pixelDensity;

        w = w || 1;
        h = h || 1;

        if (normalize == 1) // -1 to 1
        {
            let xx = (x / w * 2.0 - 1.0);
            let yy = (y / h * 2.0 - 1.0);
            xx = CABLES.clamp(xx, -1, 1);
            yy = CABLES.clamp(yy, -1, 1);

            outMouseX.set(xx);
            outMouseY.set(yy);
        }
        else if (normalize == 2) // 0 to 1
        {
            let xx = x / w;
            let yy = y / h;

            xx = CABLES.clamp(xx, 0, 1);
            yy = CABLES.clamp(yy, 0, 1);

            outMouseX.set(xx);
            outMouseY.set(yy);
        }
    }
}

/**
 * @param {PointerEvent} e
 */
function checkHovering(e)
{
    if (e.pointerType == "touch") return true;
    const r = sizeElement.getBoundingClientRect();

    let hovering = (
        e.clientX > r.left &&
            e.clientX < r.left + r.width &&
            e.clientY > r.top &&
            e.clientY < r.top + r.height
    );

    return hovering;
}

inEventType.onChange = function ()
{
    removeListeners();
    addListeners();
};

active.onChange = function ()
{
    if (listenerElement)removeListeners();
    if (active.get())addListeners();
};

function updateCoordNormalizing()
{
    if (inCoords.get() == "Pixel") normalize = 0;
    else if (inCoords.get() == "-1 to 1") normalize = 1;
    else if (inCoords.get() == "0 to 1") normalize = 2;
    else if (inCoords.get() == "Pixel Display") normalize = 3;
}

function onMouseEnter(e)
{
    if (e.pointerType == "touch")
    {
        startTimeDown = 0;
        mouseDown.set(false);
        mouseOver.set(checkHovering(e));
    }
}

function onMouseDown(e)
{
    onmousemove(e);
    if (!checkHovering(e)) return;
    mouseDown.set(true);
    startTimeDown = performance.now();
}

function onMouseUp(e)
{
    onmousemove(e);

    mouseDown.set(false);
    if (performance.now() - startTimeDown < 200)
    {
        if (e.which == 1) mouseClick.trigger();
        if (e.which == 3)
        {
            if (mouseClickRight.isLinked())e.preventDefault();
            mouseClickRight.trigger();
        }
    }
    if (inPreventDefault.get())e.preventDefault();
}

function onMouseLeave(e)
{
    startTimeDown = 0;
    mouseDown.set(false);
    mouseOver.set(checkHovering(e));
}

function setCoords(e)
{
    let x = e.clientX;
    let y = e.clientY;

    if (area.get() != "Document")
    {
        x = e.offsetX;
        y = e.offsetY;
    }
    if (area.get() === "Canvas Area")
    {
        const r = sizeElement.getBoundingClientRect();
        x = e.clientX - r.left;
        y = e.clientY - r.top;
    }

    if (inEle.isLinked())
    {
        x = e.offsetX;
        y = e.offsetY;
    }

    if (flipY.get()) y = sizeElement.clientHeight - y;

    setValue(x / cgl.pixelDensity, y / cgl.pixelDensity);
    outMoved.trigger();
}

function onmousemove(e)
{
    mouseOver.set(checkHovering(e));
    setCoords(e);

    outIsPrimary.set(e.isPrimary);

    outMovementX.set(e.movementX / cgl.pixelDensity);
    outMovementY.set(e.movementY / cgl.pixelDensity);

    if (inPreventDefault.get())e.preventDefault();

    outEvent.setRef(e);
}

function ontouchmove(e)
{
    if (event.touches && event.touches.length > 0) setCoords(e.touches[0]);
}

function ontouchstart(event)
{
    mouseDown.set(true);

    if (event.touches && event.touches.length > 0) onMouseDown(event.touches[0]);
}

function ontouchend(event)
{
    mouseDown.set(false);
    onMouseUp();
}

function removeListeners()
{
    if (!listenerElement) return;
    listenerElement.removeEventListener("touchend", ontouchend);
    listenerElement.removeEventListener("touchstart", ontouchstart);
    listenerElement.removeEventListener("touchmove", ontouchmove);

    listenerElement.removeEventListener("mousemove", onmousemove);
    listenerElement.removeEventListener("mouseleave", onMouseLeave);
    listenerElement.removeEventListener("mousedown", onMouseDown);
    listenerElement.removeEventListener("mouseup", onMouseUp);
    listenerElement.removeEventListener("mouseenter", onMouseEnter);

    listenerElement.removeEventListener("pointerdown", onMouseDown);
    listenerElement.removeEventListener("pointerup", onMouseUp);
    listenerElement.removeEventListener("pointermove", onmousemove);
    listenerElement.removeEventListener("pointerleave", onMouseLeave);
    listenerElement.removeEventListener("pointerenter", onMouseEnter);
    listenerElement = null;
}

function addListeners()
{
    if (listenerElement || !active.get())removeListeners();
    if (!active.get()) return;

    listenerElement = sizeElement = cgl.canvas;
    if (area.get() == "Canvas Area")
    {
        sizeElement = cgl.canvas.parentElement;
        listenerElement = document.body;
    }
    if (area.get() == "Document") sizeElement = listenerElement = document.body;
    if (area.get() == "Parent Element") listenerElement = sizeElement = cgl.canvas.parentElement;

    if (inEle.isLinked() && inEle.get())listenerElement = inEle.get();

    listenerElement.style["touch-action"] = "none";

    let passive = false;
    if (inPassive.get())passive = { "passive": true };

    if (inEventType.get() == "Touch")
    {
        listenerElement.addEventListener("touchend", ontouchend, passive);
        listenerElement.addEventListener("touchstart", ontouchstart, passive);
        listenerElement.addEventListener("touchmove", ontouchmove, passive);
    }

    if (inEventType.get() == "Mouse")
    {
        listenerElement.addEventListener("mousemove", onmousemove, passive);
        listenerElement.addEventListener("mouseleave", onMouseLeave, passive);
        listenerElement.addEventListener("mousedown", onMouseDown, passive);
        listenerElement.addEventListener("mouseup", onMouseUp, passive);
        listenerElement.addEventListener("mouseenter", onMouseEnter, passive);
    }

    if (inEventType.get() == "Pointer")
    {
        listenerElement.addEventListener("pointermove", onmousemove, passive);
        listenerElement.addEventListener("pointerleave", onMouseLeave, passive);
        listenerElement.addEventListener("pointerdown", onMouseDown, passive);
        listenerElement.addEventListener("pointerup", onMouseUp, passive);
        listenerElement.addEventListener("pointerenter", onMouseEnter, passive);
    }
}

//
