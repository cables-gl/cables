const
    inCoords = op.inSwitch("Coordinates", ["-1 to 1", "Pixel Display", "Pixel", "0 to 1"], "-1 to 1"),
    area = op.inValueSelect("Area", ["Canvas Area", "Canvas", "Document", "Parent Element"], "Canvas Area"),
    flipY = op.inValueBool("flip y", true),
    rightClickPrevDef = op.inBool("right click prevent default", true),
    inEventType = op.inSwitch("Events", ["Pointer", "Touch", "Mouse"]),
    inPassive = op.inValueBool("Passive Events", false),
    inEle = op.inObject("Element", "element"),
    active = op.inValueBool("Active", true),
    outMouseX = op.outNumber("x", 0),
    outMouseY = op.outNumber("y", 0),
    mouseClick = op.outTrigger("click"),
    mouseClickRight = op.outTrigger("click right"),
    mouseDown = op.outBoolNum("Button is down"),
    mouseOver = op.outBoolNum("Mouse is hovering"),
    outMovementX = op.outNumber("Movement X", 0),
    outMovementY = op.outNumber("Movement Y", 0),
    outEvent = op.outObject("Event");

const cgl = op.patch.cgl;
let normalize = 1;
let listenerElement = null;
let areaElement = null;

inPassive.onChange =
    area.onChange = addListeners;
inCoords.onChange = updateCoordNormalizing;
op.onDelete = removeListeners;

addListeners();

op.on("loadedValueSet", onStart);

function onStart()
{
    if (normalize == 0)
    {
        if (areaElement.clientWidth === 0) setTimeout(onStart, 50);

        outMouseX.set(areaElement.clientWidth / 2);
        outMouseY.set(areaElement.clientHeight / 2);
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
        if (areaElement.clientWidth === 0)
        {
            setTimeout(onStart, 50);
        }

        outMouseX.set(areaElement.clientWidth / 2 / cgl.pixelDensity);
        outMouseY.set(areaElement.clientHeight / 2 / cgl.pixelDensity);
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
        let w = areaElement.clientWidth / cgl.pixelDensity;
        let h = areaElement.clientHeight / cgl.pixelDensity;

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

function checkHovering(e)
{
    if (!areaElement) return;
    const r = areaElement.getBoundingClientRect();

    return (
        e.clientX > r.left &&
        e.clientX < r.left + r.width &&
        e.clientY > r.top &&
        e.clientY < r.top + r.height
    );
}

inEle.onChange =
inEventType.onChange = function ()
{
    area.setUiAttribs({ "greyout": inEle.isLinked() });
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

/// ///

function onMouseEnter(e)
{
    outEvent.setRef(e);
    mouseDown.set(false);
    mouseOver.set(checkHovering(e));
}

function onMouseDown(e)
{
    if (!checkHovering(e)) return;
    outEvent.setRef(e);
    mouseDown.set(true);
}

function onMouseUp(e)
{
    outEvent.setRef(e);
    mouseDown.set(false);
}

function onClickRight(e)
{
    if (!checkHovering(e)) return;
    outEvent.setRef(e);
    mouseClickRight.trigger();
    if (rightClickPrevDef.get()) e.preventDefault();
}

function onmouseclick(e)
{
    if (!checkHovering(e)) return;
    outEvent.setRef(e);
    mouseClick.trigger();
}

function onMouseLeave(e)
{
    outEvent.setRef(e);
    mouseDown.set(false);
    mouseOver.set(checkHovering(e));
}

function onmousemove(e)
{
    mouseOver.set(checkHovering(e));
    if (area.get() === "Canvas Area")
    {
        const r = areaElement.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;

        if (x < 0 || x > r.width || y > r.height || y < 0) return;
    }

    outEvent.setRef(e);
    setCoords(e);

    outMovementX.set(e.movementX / cgl.pixelDensity);
    outMovementY.set(e.movementY / cgl.pixelDensity);
}

function ontouchmove(e)
{
    if (event.touches && event.touches.length > 0) setCoords(e.touches[0]);
    outEvent.setRef(e);
}

function ontouchstart(event)
{
    mouseDown.set(true);

    if (event.touches && event.touches.length > 0) onMouseDown(event.touches[0]);
    outEvent.setRef(e);
}

function ontouchend(event)
{
    mouseDown.set(false);
    onMouseUp();
    outEvent.setRef(e);
}

/// ////

function setCoords(e)
{
    let x = e.clientX;
    let y = e.clientY;

    if (inEle.isLinked())
    {
        x = e.offsetX;
        y = e.offsetY;
    }
    else
    {
        if (area.get() != "Document")
        {
            x = e.offsetX;
            y = e.offsetY;
        }
        if (area.get() === "Canvas Area")
        {
            const r = areaElement.getBoundingClientRect();
            x = e.clientX - r.left;
            y = e.clientY - r.top;

            if (x < 0 || x > r.width || y > r.height || y < 0) return;
            x = CABLES.clamp(x, 0, r.width);
            y = CABLES.clamp(y, 0, r.height);
        }
    }

    if (flipY.get()) y = areaElement.clientHeight - y;

    setValue(x / cgl.pixelDensity, y / cgl.pixelDensity);
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

    listenerElement.removeEventListener("pointermove", onmousemove);
    listenerElement.removeEventListener("pointerleave", onMouseLeave);
    listenerElement.removeEventListener("pointerdown", onMouseDown);
    listenerElement.removeEventListener("pointerup", onMouseUp);
    listenerElement.removeEventListener("pointerenter", onMouseEnter);

    listenerElement.removeEventListener("click", onmouseclick);
    listenerElement.removeEventListener("contextmenu", onClickRight);
    listenerElement = null;
}

function addListeners()
{
    if (listenerElement || !active.get())removeListeners();
    if (!active.get()) return;

    listenerElement = areaElement = cgl.canvas;

    if (inEle.isLinked())
    {
        listenerElement = areaElement = inEle.get();
    }
    else
    {
        if (area.get() == "Canvas Area")
        {
            areaElement = cgl.canvas.parentElement;
            listenerElement = document.body;
        }
        if (area.get() == "Document") areaElement = listenerElement = document.body;
        if (area.get() == "Parent Element") listenerElement = areaElement = cgl.canvas.parentElement;
    }

    if (!areaElement)
    {
        op.setUiError("noarea", "could not find area element for mouse", 2);
        return;
    }
    op.setUiError("noarea", null);

    let passive = false;
    if (inPassive.get())passive = { "passive": true };

    if (inEventType.get() == "touch")
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

    listenerElement.addEventListener("contextmenu", onClickRight, passive);
    listenerElement.addEventListener("click", onmouseclick, passive);
}

//
