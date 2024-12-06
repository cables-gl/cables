const
    parentPort = op.inObject("link"),
    labelPort = op.inString("Text", "Toggle"),
    inputValue = op.inBool("Input", true),
    storeDefaultValueButton = op.inTriggerButton("Set Default"),
    defaultValuePort = op.inBool("Default"),
    inGreyOut = op.inBool("Grey Out", false),
    inVisible = op.inBool("Visible", true),
    siblingsPort = op.outObject("childs"),
    valuePort = op.outBoolNum("Value", defaultValuePort.get()),
    outToggled = op.outTrigger("Toggled");

defaultValuePort.setUiAttribs({ "hidePort": true, "greyout": true });

const classNameActive = "sidebar__toggle--active";

const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__toggle");
el.classList.add("sidebar__reloadable");
el.classList.add(classNameActive);

const labelText = document.createTextNode(labelPort.get());
const label = document.createElement("div");
label.classList.add("sidebar__item-label");
label.appendChild(labelText);

const icon = document.createElement("a");

valuePort.set(defaultValuePort.get());

icon.classList.add("icon_toggle");
icon.addEventListener("click", onInputClick);
icon.addEventListener("keypress", onKeyPress);

icon.setAttribute("tabindex", 0);
icon.setAttribute("aria-label", "toggle " + labelPort.get());

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
greyOut.style.display = "none";

el.appendChild(greyOut);
el.appendChild(icon);
el.appendChild(label);
el.addEventListener("dblclick", reset);

op.init = () =>
{
    reset();
    updateClass();
};
op.onDelete = onDelete;
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inputValue.onChange = onInputValueChanged;
storeDefaultValueButton.onTriggered = storeDefaultValue;

function reset()
{
    valuePort.set(defaultValuePort.get());
    inputValue.set(defaultValuePort.get());
    outToggled.trigger();
}

function storeDefaultValue()
{
    const defaultValue = inputValue.get();

    defaultValuePort.set(defaultValue);
    valuePort.set(defaultValue);
    outToggled.trigger();
    op.refreshParams();
}

function updateClass()
{
    const isActive = valuePort.get();
    if (isActive)
    {
        icon.classList.add("icon_toggle_true");
        icon.classList.remove("icon_toggle_false");
    }
    else
    {
        icon.classList.remove("icon_toggle_true");
        icon.classList.add("icon_toggle_false");
    }
}

function onKeyPress(e)
{
    if (e.code === "Enter") onInputClick();
}

function onInputClick()
{
    el.classList.toggle(classNameActive);

    const isActive = el.classList.contains(classNameActive);
    valuePort.set(isActive);
    inputValue.set(isActive);

    updateClass();
    outToggled.trigger();
    op.refreshParams();
}

function onInputValueChanged()
{
    if (inputValue.get()) el.classList.add(classNameActive);
    else el.classList.remove(classNameActive);

    valuePort.set(inputValue.get());
    outToggled.trigger();
}

function onLabelTextChanged()
{
    const text = labelPort.get();
    label.textContent = text;
    icon.setAttribute("aria-label", "toggle " + labelPort.get());
    if (CABLES.UI) op.setUiAttrib({ "extendTitle": text });
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
    else if (el.parentElement) el.parentElement.removeChild(el);
}

function showElement(element)
{
    if (element) element.style.display = "block";
}

function hideElement(element)
{
    if (element) element.style.display = "none";
}

function onDelete()
{
    if (el && el.parentNode && el.parentNode.removeChild) el.parentNode.removeChild(el);
}

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};
