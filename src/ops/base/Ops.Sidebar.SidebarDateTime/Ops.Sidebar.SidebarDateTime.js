const
    parentPort = op.inObject("Link"),
    labelPort = op.inString("Text", "Date"),
    defaultValuePort = op.inString("Default", "2024-01-01"),
    inMin = op.inString("Min", ""),
    inMax = op.inString("Max", ""),
    inType = op.inDropDown("Type", ["date", "datetime-local"], "date"),
    inGreyOut = op.inBool("Grey Out", false),
    inVisible = op.inBool("Visible", true),
    siblingsPort = op.outObject("Children"),
    valuePort = op.outString("Result", defaultValuePort.get()),
    outFocus = op.outBool("Focus");

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
    input.value = defaultValuePort.get();
    onInput();
});

let input = null;
creatElement();

op.toWorkPortsNeedToBeLinked(parentPort);

inMin.onChange =
inMax.onChange =
inType.onChange = setAttribs;

function setAttribs()
{
    input.setAttribute("type", inType.get());
    input.setAttribute("value", defaultValuePort.get());
    input.setAttribute("min", inMin.get());
    input.setAttribute("max", inMax.get());
}

function creatElement()
{
    if (input)input.remove();
    input = document.createElement("input");

    input.classList.add("sidebar__text-input-input");

    setAttribs();

    el.appendChild(input);
    input.addEventListener("input", onInput);
    input.addEventListener("focus", onFocus);
    input.addEventListener("blur", onBlur);
}

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

function onFocus()
{
    outFocus.set(true);
}

function onBlur()
{
    outFocus.set(false);
}

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
    op.setUiError("exc", null);
    let endDateIso = "";
    try
    {
        endDateIso = new Date(input.value).toISOString();
    }
    catch (e)
    {
        console.error(e);
        op.setUiError("exc", e.message);
    }
    valuePort.set(endDateIso);
}

function onDefaultValueChanged()
{
    let defaultValue = defaultValuePort.get() || "";

    input.value = (defaultValue.trim()) || "2001-01-01";
    // valuePort.set(defaultValue);
    onInput();
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
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}
