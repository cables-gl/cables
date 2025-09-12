const
    parentPort = op.inObject("Link"),
    labelPort = op.inString("Text", "Text"),
    defaultValuePort = op.inString("Default", ""),
    inPlaceholder = op.inString("Placeholder", ""),
    inType = op.inSwitch("Type", ["text", "password", "search"], "text"),
    inTextArea = op.inBool("TextArea", false),
    inGreyOut = op.inBool("Grey Out", false),
    inVisible = op.inBool("Visible", true),
    // inSpellCheck = op.inBool("Spellcheck", true),
    inEnterPd = op.inBool("Enter Key Prevent Default", false),
    inClear = op.inTriggerButton("Clear"),
    inFocus = op.inTriggerButton("Focus Input"),
    siblingsPort = op.outObject("Children"),
    valuePort = op.outString("Result", defaultValuePort.get()),
    outFocus = op.outBool("Focus"),
    outKeyEnter = op.outTrigger("Keypress Enter"),
    outKeyEsc = op.outTrigger("Keypress ESC");

const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text-input");
el.classList.add("sidebar__reloadable");

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

label.addEventListener("dblclick", function ()
{
    valuePort.set(defaultValuePort.get());
    input.value = defaultValuePort.get();
});

let input = null;
creatElement();

op.toWorkPortsNeedToBeLinked(parentPort);

inTextArea.onChange = creatElement;
inType.onChange = setAttribs;

function setAttribs()
{
    input.setAttribute("type", inType.get());
    input.setAttribute("value", defaultValuePort.get());
    input.setAttribute("placeholder", inPlaceholder.get());
    // updateSpellcheck();
}

function creatElement()
{
    if (input)input.remove();
    if (!inTextArea.get())
    {
        input = document.createElement("input");
    }
    else
    {
        input = document.createElement("textarea");
        onDefaultValueChanged();
    }

    input.classList.add("sidebar__text-input-input");

    setAttribs();

    el.appendChild(input);
    input.addEventListener("input", onInput);
    input.addEventListener("focus", onFocus);
    input.addEventListener("blur", onBlur);
    input.addEventListener("keydown", function (event)
    {
        if (event.key === "Enter")
        {
            outKeyEnter.trigger();
            if (inEnterPd.get())event.preventDefault();
        }

        if (event.key === "Escape")
        {
            outKeyEsc.trigger();
            event.preventDefault();
        }
    });
}
// sadly not reliable....
// function updateSpellcheck()
// {
//     if (inSpellCheck.get())
//         input.removeAttribute("spellcheck");
//     else
//         input.setAttribute("spellcheck", "true");
// }

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inClear.onTriggered = () =>
{
    input.value = "";
    valuePort.set(input.value);
};
inFocus.onTriggered = () =>
{
    input.focus();
};

function onFocus()
{
    outFocus.set(true);
}

function onBlur()
{
    outFocus.set(false);
}

// inSpellCheck.onChange = updateSpellcheck;

inPlaceholder.onChange = () =>
{
    input.setAttribute("placeholder", inPlaceholder.get());
};

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;

// functions

function onInput(ev)
{
    valuePort.set(ev.target.value);
}

function onDefaultValueChanged()
{
    const defaultValue = defaultValuePort.get();
    valuePort.set(defaultValue);
    input.value = defaultValue;
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;
    if (CABLES.UI) op.setUiAttrib({ "extendTitle": labelText });
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el) el.style.display = "block";
}

function hideElement(el)
{
    if (el)el.style.display = "none";
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
        el.parentNode.removeChild(el);
}
