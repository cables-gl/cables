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

// todo remove in next version
function keyCodeToName(keyCode)
{
    if (!keyCode && keyCode !== 0) return "Unidentified";
    const keys = {
        "8": "Backspace",
        "9": "Tab",
        "12": "Clear",
        "13": "Enter",
        "16": "Shift",
        "17": "Control",
        "18": "Alt",
        "19": "Pause",
        "20": "CapsLock",
        "27": "Escape",
        "32": "Space",
        "33": "PageUp",
        "34": "PageDown",
        "35": "End",
        "36": "Home",
        "37": "ArrowLeft",
        "38": "ArrowUp",
        "39": "ArrowRight",
        "40": "ArrowDown",
        "45": "Insert",
        "46": "Delete",
        "112": "F1",
        "113": "F2",
        "114": "F3",
        "115": "F4",
        "116": "F5",
        "117": "F6",
        "118": "F7",
        "119": "F8",
        "120": "F9",
        "121": "F10",
        "122": "F11",
        "123": "F12",
        "144": "NumLock",
        "145": "ScrollLock",
        "224": "Meta"
    };
    if (keys[keyCode])
    {
        return keys[keyCode];
    }
    else
    {
        return String.fromCharCode(keyCode);
    }
}

function onKeyPress(e)
{
    const keyName = keyCodeToName(e.keyCode);
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
