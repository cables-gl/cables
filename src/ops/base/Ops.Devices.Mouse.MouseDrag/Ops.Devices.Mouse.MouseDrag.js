const
    active = op.inValueBool("Active", true),
    speed = op.inValue("Speed", 0.01),
    inputType = op.inSwitch("Input Type", ["All", "Mouse", "Touch"], "All"),
    area = op.inSwitch("Area", ["Canvas Area", "Canvas", "Document"], "Canvas Area"),
    outDeltaX = op.outNumber("Delta X"),
    outDeltaY = op.outNumber("Delta Y"),
    outDragging = op.outNumber("Is Dragging");

let listenerElement = null;
let sizeElement = null;
const absoluteX = 0;
const absoluteY = 0;
let pressed = false;
let lastX = 0;
let lastY = 0;
let firstMove = true;

inputType.onChange =
area.onChange = updateArea;

updateArea();

function isHovering(e)
{
    if (area.get() === "Canvas Area")
    {
        const r = sizeElement.getBoundingClientRect();

        return (
            e.clientX > r.left &&
            e.clientX < r.left + r.width &&
            e.clientY > r.top &&
            e.clientY < r.top + r.height
        );
    }
    return true;
}

function onMouseMove(e)
{
    if (e.touches) e = e.touches[0];

    if (pressed && e && isHovering(e))
    {
        if (!firstMove)
        {
            outDragging.set(true);
            const deltaX = (e.clientX - lastX) * speed.get();
            const deltaY = (e.clientY - lastY) * speed.get();

            outDeltaX.set(0);
            outDeltaY.set(0);
            outDeltaX.set(deltaX);
            outDeltaY.set(deltaY);
        }

        firstMove = false;

        lastX = e.clientX;
        lastY = e.clientY;
    }
}

function onMouseDown(e)
{
    try { listenerElement.setPointerCapture(e.pointerId); }
    catch (_e) {}

    pressed = true;
}

function onMouseUp(e)
{
    try { listenerElement.releasePointerCapture(e.pointerId); }
    catch (e) {}

    pressed = false;
    outDragging.set(false);
    lastX = 0;
    lastY = 0;
    firstMove = true;
}

function updateArea()
{
    removeListener();

    if (area.get() == "Canvas Area")
    {
        listenerElement = document;
        sizeElement = op.patch.cgl.canvas;
    }
    else if (area.get() == "Document") listenerElement = sizeElement = document;
    else listenerElement = sizeElement = op.patch.cgl.canvas;

    if (active.get())addListener();
}

function addListener()
{
    if (!listenerElement)updateArea();

    if (inputType.get() == "All" || inputType.get() == "Mouse")
    {
        listenerElement.addEventListener("mousemove", onMouseMove);
        listenerElement.addEventListener("mousedown", onMouseDown);
        listenerElement.addEventListener("mouseup", onMouseUp);
        listenerElement.addEventListener("mouseenter", onMouseUp);
        listenerElement.addEventListener("mouseleave", onMouseUp);
    }

    if (inputType.get() == "All" || inputType.get() == "Touch")
    {
        listenerElement.addEventListener("touchmove", onMouseMove);
        listenerElement.addEventListener("touchend", onMouseUp);
        listenerElement.addEventListener("touchstart", onMouseDown);
    }
}

function removeListener()
{
    if (!listenerElement) return;
    listenerElement.removeEventListener("mousemove", onMouseMove);
    listenerElement.removeEventListener("mousedown", onMouseDown);
    listenerElement.removeEventListener("mouseup", onMouseUp);
    listenerElement.removeEventListener("mouseenter", onMouseUp);
    listenerElement.removeEventListener("mouseleave", onMouseUp);

    listenerElement.removeEventListener("touchmove", onMouseMove);
    listenerElement.removeEventListener("touchend", onMouseUp);
    listenerElement.removeEventListener("touchstart", onMouseDown);
}

active.onChange = function ()
{
    if (active.get())addListener();
    else removeListener();
};

op.onDelete = function ()
{
    removeListener();
};
