// inputs
let parentPort = op.inObject("link");
let labelPort = op.inValueString("Text", "Value");
let inId = op.inValueString("Id", "");

// outputs
let siblingsPort = op.outObject("childs");

// vars
let el = document.createElement("div");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");
let label = document.createElement("div");
label.classList.add("sidebar__item-label");
let labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// functions

function onIdChanged()
{
    el.id = inId.get();
}

function onLabelTextChanged()
{
    let labelText = labelPort.get();
    label.textContent = labelText;
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
