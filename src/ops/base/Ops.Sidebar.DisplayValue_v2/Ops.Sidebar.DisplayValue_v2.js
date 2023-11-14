// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text", "Value");
const valuePort = op.inString("Value", "");

// outputs
const siblingsPort = op.outObject("childs");

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__value-display");
const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelTextNode = document.createTextNode(labelPort.get());
label.appendChild(labelTextNode);
el.appendChild(label);
const value = document.createElement("div");
value.textContent = valuePort.get();
value.classList.add("sidebar__item-value-label");
el.appendChild(value);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
valuePort.onChange = onValueChanged;
op.onDelete = onDelete;

// functions

function onValueChanged()
{
    value.textContent = valuePort.get();
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;
    if (CABLES.UI)
    {
        op.setUiAttrib({ "extendTitle": labelText });

        // op.setTitle("Value: " + labelText);
    }
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

function showElement(element)
{
    if (element)
    {
        element.style.display = "block";
    }
}

function hideElement(element)
{
    if (element)
    {
        element.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(element)
{
    if (element && element.parentNode && element.parentNode.removeChild)
    {
        element.parentNode.removeChild(element);
    }
}
