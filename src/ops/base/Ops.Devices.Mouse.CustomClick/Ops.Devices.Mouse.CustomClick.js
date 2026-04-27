const
    mouseClickLeft = op.outTrigger("Click Left"),
    // area = op.inValueSelect("Area", ["Canvas Area", "Canvas", "Document", "Parent Element"], "Canvas Area"),
    inDur = op.inFloat("Max Duration Button Down", 0.3),
    inPixel = op.inInt("Max Movement Pixel", 5),
    inButton = op.inSwitch("Button", ["Left", "Middle", "Right"], "Left"),
    inEle = op.inObject("Element", null, "element"),
    active = op.inValueBool("Active", true);

const cgl = op.patch.cgl;
let listenerElement = null;

inEle.onChange = updateListeners;
op.onDelete = removeListeners;

op.onLoaded = updateListeners;
active.onChange = updateListeners;

updateListeners();
let startTime = 0;
let startX = 0;
let startY = 0;
let which = 1;

inButton.onChange = () =>
{
    if (inButton.get() == "Left")which = 1;
    if (inButton.get() == "Middle")which = 2;
    if (inButton.get() == "Right")which = 3;
};

function onMouseDown(e)
{
    if (e.which != which) return;

    startX = e.clientX;
    startY = e.clientY;
    startTime = performance.now();
    // console.log("eee", e);
}

function onMouseUp(e)
{
    if (e.which != which) return;

    if ((performance.now() - startTime) / 1000 < inDur.get())
    {
        if (Math.abs(startX - e.clientX) < inPixel.get() && Math.abs(startY - e.clientY) < inPixel.get())
        {
            mouseClickLeft.trigger();
        }
    }
}

function removeListeners()
{
    if (!listenerElement) return;
    listenerElement.removeEventListener("pointerdown", onMouseDown);
    listenerElement.removeEventListener("pointerup", onMouseUp);
    listenerElement = null;
}

function addListeners()
{
    if (listenerElement)removeListeners();

    listenerElement = cgl.canvas;
    if (inEle.get())listenerElement = inEle.get();

    listenerElement.addEventListener("pointerdown", onMouseDown);
    listenerElement.addEventListener("pointerup", onMouseUp);
    // listenerElement.addEventListener("mouseleave", onMouseUp);
}

function updateListeners()
{
    removeListeners();
    if (active.get()) addListeners();
}
