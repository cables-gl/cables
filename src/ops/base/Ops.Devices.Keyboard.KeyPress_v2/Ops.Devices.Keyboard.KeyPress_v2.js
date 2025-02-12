const inArea = op.inValueSelect("Area", ["Canvas", "Document", "Parent Element"], "Canvas");
const preventDefault = op.inBool("Prevent Default", false);
const inEnable = op.inBool("Enabled", true);
const onPress = op.outTrigger("On Press");
const keyCode = op.outNumber("Key Code");
const outKey = op.outString("Key");

const cgl = op.patch.cgl;
let listenerElement = null;

inArea.onChange = inEnable.onChange = () =>
{
    if (inEnable.get())
    {
        addListeners();
    }
    else
    {
        removeListeners();
    }
};

op.onDelete = () =>
{
    removeListeners();
};

function onKeyPress(e)
{
    const keyName = CABLES.keyCodeToName(e.keyCode);
    op.setUiAttribs({ "extendTitle": keyName });
    outKey.set(keyName);
    keyCode.set(e.keyCode);
    onPress.trigger();
    if (preventDefault.get()) e.preventDefault();
}

function addListeners()
{
    if (listenerElement) removeListeners();

    listenerElement = cgl.canvas;

    if (!CABLES.isNumeric(cgl.canvas.getAttribute("tabindex"))) cgl.canvas.setAttribute("tabindex", 1);

    if (inArea.get() === "Document") listenerElement = document.body;
    if (inArea.get() === "Parent Element") listenerElement = cgl.canvas.parentElement;

    listenerElement.addEventListener("keydown", onKeyPress);
}

function removeListeners()
{
    if (!listenerElement) return;
    listenerElement.removeEventListener("keydown", onKeyPress);
    listenerElement = null;
}

addListeners();
