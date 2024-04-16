const
    disableScaleWeb = op.inValueBool("Disable Scaling", true),
    disableDefault = op.inValueBool("Disable Scroll", true),
    hdpi = op.inValueBool("HDPI Coordinates", false),
    active = op.inValueBool("Active", true),

    outTouched = op.outNumber("Touched", false),
    numFingers = op.outNumber("Fingers", 0),

    f1x = op.outNumber("Finger 1 X", 0),
    f1y = op.outNumber("Finger 1 Y", 0),
    f1f = op.outNumber("Finger 1 Force", 0),

    f2x = op.outNumber("Finger 2 X", 0),
    f2y = op.outNumber("Finger 2 Y", 0),
    f2f = op.outNumber("Finger 2 Force", 0),
    area = op.inSwitch("Area", ["Canvas", "Document"], "Canvas"),

    outEvents = op.outArray("Events"),
    normalize = op.inValueBool("Normalize Coordinates"),
    flipY = op.inValueBool("Flip Y"),
    outTouchStart = op.outTrigger("Touch Start"),
    outTouchEnd = op.outTrigger("Touch End");

area.onChange = updateArea;

function setPos(event)
{
    if (event.touches && event.touches.length > 0)
    {
        var rect = event.target.getBoundingClientRect();
        var x = event.touches[0].clientX - event.touches[0].target.offsetLeft;
        var y = event.touches[0].clientY - event.touches[0].target.offsetTop;

        if (flipY.get()) y = rect.height - y;

        if (hdpi.get())
        {
            x *= (op.patch.cgl.pixelDensity || 1);
            y *= (op.patch.cgl.pixelDensity || 1);
        }

        if (normalize.get())
        {
            x = (x / rect.width * 2.0 - 1.0);
            y = (y / rect.height * 2.0 - 1.0);
        }

        f1x.set(x);
        f1y.set(y);

        if (event.touches[0].force)f1f.set(event.touches[0].force);
    }

    if (event.touches && event.touches.length > 1)
    {
        var rect = event.target.getBoundingClientRect();
        var x = event.touches[1].clientX - event.touches[1].target.offsetLeft;
        var y = event.touches[1].clientY - event.touches[1].target.offsetTop;

        if (hdpi.get())
        {
            x *= (op.patch.cgl.pixelDensity || 1);
            y *= (op.patch.cgl.pixelDensity || 1);
        }

        if (normalize.get())
        {
            x = (x / rect.width * 2.0 - 1.0);
            y = (y / rect.height * 2.0 - 1.0);
        }

        f2x.set(x);
        f2y.set(y);

        if (event.touches[1].force)f2f.set(event.touches[1].force);
    }
    outEvents.set(event.touches);
}

const ontouchstart = function (event)
{
    outTouched.set(true);
    setPos(event);
    numFingers.set(event.touches.length);
    outTouchStart.trigger();
};

const ontouchend = function (event)
{
    outTouched.set(false);
    f1f.set(0);
    f2f.set(0);
    setPos(event);

    numFingers.set(event.touches.length);
    outTouchEnd.trigger();
};

const ontouchmove = function (event)
{
    setPos(event);
    numFingers.set(event.touches.length);
    if (disableDefault.get() || (disableScaleWeb.get() && event.scale !== 1))
    {
        event.preventDefault();
        document.body.style["touch-action"] = "none";
    }
    else
    {
        document.body.style["touch-action"] = "initial";
    }
};

const cgl = op.patch.cgl;
let listenerElement = null;
function addListeners()
{
    listenerElement.addEventListener("touchmove", ontouchmove, { "passive": false });
    listenerElement.addEventListener("touchstart", ontouchstart, { "passive": false });
    listenerElement.addEventListener("touchend", ontouchend, { "passive": false });
}

function updateArea()
{
    removeListeners();

    if (area.get() == "Document") listenerElement = document;
    else listenerElement = cgl.canvas;

    if (active.get()) addListeners();
}

function removeListeners()
{
    if (listenerElement)
    {
        listenerElement.removeEventListener("touchmove", ontouchmove);
        listenerElement.removeEventListener("touchstart", ontouchstart);
        listenerElement.removeEventListener("touchend", ontouchend);
    }
    listenerElement = null;
}

active.onChange = function ()
{
    updateArea();
};

updateArea();
