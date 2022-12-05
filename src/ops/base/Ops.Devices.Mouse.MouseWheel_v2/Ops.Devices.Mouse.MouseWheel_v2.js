const
    speed = op.inValue("Speed", 1),
    preventScroll = op.inValueBool("prevent scroll", true),
    flip = op.inValueBool("Flip Direction"),
    inSimpleIncrement = op.inBool("Simple Delta", true),
    area = op.inSwitch("Area", ["Canvas", "Document", "Parent"], "Document"),
    active = op.inValueBool("active", true),
    delta = op.outNumber("delta", 0),
    deltaX = op.outNumber("delta X", 0),
    deltaOrig = op.outNumber("browser event delta", 0),
    trigger = op.outTrigger("Wheel Action");

const cgl = op.patch.cgl;
const value = 0;

const startTime = CABLES.now() / 1000.0;
const v = 0;

let dir = 1;

let listenerElement = null;

area.onChange = updateArea;
const vOut = 0;

addListener();

const isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

const isWindows = window.navigator.userAgent.indexOf("Windows") != -1;
const isLinux = window.navigator.userAgent.indexOf("Linux") != -1;
const isMac = window.navigator.userAgent.indexOf("Mac") != -1;

const isChrome = (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera === false && isIEedge === false);
const isFirefox = navigator.userAgent.search("Firefox") > 1;

flip.onChange = function ()
{
    if (flip.get())dir = -1;
    else dir = 1;
};

function normalizeWheel(event)
{
    let sY = 0;

    if ("detail" in event) { sY = event.detail; }

    if ("deltaY" in event)
    {
        sY = event.deltaY;
        if (event.deltaY > 20)sY = 20;
        else if (event.deltaY < -20)sY = -20;
    }
    return sY * dir;
}

function normalizeWheelX(event)
{
    let sX = 0;

    if ("deltaX" in event)
    {
        sX = event.deltaX;
        if (event.deltaX > 20)sX = 20;
        else if (event.deltaX < -20)sX = -20;
    }
    return sX;
}

let lastEvent = 0;

function onMouseWheel(e)
{
    if (Date.now() - lastEvent < 10) return;
    lastEvent = Date.now();

    deltaOrig.set(e.wheelDelta || e.deltaY);

    if (e.deltaY)
    {
        let d = normalizeWheel(e);
        if (inSimpleIncrement.get())
        {
            if (d > 0)d = speed.get();
            else d = -speed.get();
        }
        else d *= 0.01 * speed.get();

        delta.set(0);
        delta.set(d);
    }

    if (e.deltaX)
    {
        let dX = normalizeWheelX(e);
        dX *= 0.01 * speed.get();

        deltaX.set(0);
        deltaX.set(dX);
    }

    if (preventScroll.get()) e.preventDefault();
    trigger.trigger();
}

function updateArea()
{
    removeListener();

    if (area.get() == "Document") listenerElement = document;
    if (area.get() == "Parent") listenerElement = cgl.canvas.parentElement;
    else listenerElement = cgl.canvas;

    if (active.get())addListener();
}

function addListener()
{
    if (!listenerElement)updateArea();
    listenerElement.addEventListener("wheel", onMouseWheel, { "passive": false });
}

function removeListener()
{
    if (listenerElement) listenerElement.removeEventListener("wheel", onMouseWheel);
}

active.onChange = function ()
{
    updateArea();
};
