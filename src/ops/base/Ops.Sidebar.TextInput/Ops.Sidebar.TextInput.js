// inputs
const parentPort = op.inObject("Link");
const labelPort = op.inValueString("Text", "Text");
const defaultValuePort = op.inValueString("Default", "");

// outputs
const siblingsPort = op.outObject("Children");
const valuePort = op.outValue("Result", defaultValuePort.get());

// vars
let el = document.createElement("div");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text-input");
let label = document.createElement("div");
label.classList.add("sidebar__item-label");
let labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
// var inputWrapper = document.createElement('div');
// inputWrapper.classList.add('sidebar__text-input-input-wrapper');
// el.appendChild(inputWrapper);
let input = document.createElement("input");
input.classList.add("sidebar__text-input-input");
input.setAttribute("type", "text");
input.setAttribute("value", defaultValuePort.get());
// inputWrapper.appendChild(input);
el.appendChild(input);
input.addEventListener("input", onInput);
op.toWorkPortsNeedToBeLinked(parentPort);

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
    let defaultValue = defaultValuePort.get();
    valuePort.set(defaultValue);
    input.value = defaultValue;
}

function onLabelTextChanged()
{
    let labelText = labelPort.get();
    label.textContent = labelText;
    if (CABLES.UI) op.setUiAttrib({ "extendTitle": labelText });
}

function onParentChanged()
{
    let parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(null);
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
