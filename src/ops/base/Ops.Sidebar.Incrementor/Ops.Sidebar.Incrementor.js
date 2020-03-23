// inputs
const parentPort = op.inObject("link");
const labelPort = op.inValueString("Label", "Stepper");
const inMin = op.inValue("min", 0);
const inMax = op.inValue("max", 10);
const inStepsize = op.inValue("stepsize", 1);
const inValues = op.inArray("Values");

// outputs
var siblingsPort = op.outObject("childs");
var outValue = op.outNumber("value");

// vars
let currentPosition = 0;

var containerEl = document.createElement("div");
containerEl.classList.add("sidebar__item");
var label = document.createElement("div");
label.classList.add("sidebar__item-label");
var labelTextEl = document.createTextNode(labelPort.get());
label.appendChild(labelTextEl);
containerEl.appendChild(label);

const innerContainer = document.createElement("span");
innerContainer.classList.add("sidebar__item__right");

// value
var valueEl = document.createElement("span");
valueEl.style.marginRight = "10px";

let valueText = document.createTextNode(inMin.get());
if (Array.isArray(inValues.get()))
{
    valueText = document.createTextNode(inValues.get()[currentPosition]);
}

valueEl.appendChild(valueText);
innerContainer.appendChild(valueEl);

// previous
var prevEl = document.createElement("span");
prevEl.classList.add("sidebar--button");
prevEl.style.marginRight = "3px";
var prevInput = document.createElement("div");
prevInput.classList.add("sidebar__button-input");
prevInput.classList.add("minus");
prevEl.appendChild(prevInput);
prevInput.addEventListener("click", onPrev);
var prevText = document.createTextNode("-");
prevInput.appendChild(prevText);
innerContainer.appendChild(prevEl);

// next
var nextEl = document.createElement("span");
nextEl.classList.add("sidebar--button");
var nextInput = document.createElement("div");
nextInput.classList.add("sidebar__button-input");
nextInput.classList.add("plus");
nextEl.appendChild(nextInput);
nextInput.addEventListener("click", onNext);
var nextText = document.createTextNode("+");
nextInput.appendChild(nextText);

innerContainer.appendChild(nextEl);
containerEl.appendChild(innerContainer);

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// events
parentPort.onChange = onParentChanged;
inValues.onChange = onValueChange;
labelPort.onChange = onLabelTextChanged;
op.onDelete = onDelete;

function onValueChange()
{
    const values = inValues.get();
    let value = inMin.get();
    if (Array.isArray(values))
    {
        value = values[currentPosition];
        inMin.setUiAttribs({ greyout: true });
        inMax.set(values.length - 1);
        inMax.setUiAttribs({ greyout: true });
        inStepsize.setUiAttribs({ greyout: true });
        inStepsize.set(1);
    }
    else
    {
        inMin.setUiAttribs({ greyout: false });
        inMax.setUiAttribs({ greyout: false });
        inStepsize.setUiAttribs({ greyout: false });
    }
    outValue.set(value);
    valueText.textContent = value;
}

function onNext()
{
    const values = inValues.get();
    let value = 0;
    if (!Array.isArray(values))
    {
        // no array given, increment/decrement according to params
        const currentValue = outValue.get();
        value = Math.min(currentValue + inStepsize.get(), inMax.get());
    }
    else
    {
        // user inputs an array, iterate fields, ignore min/max/stepsize
        if (currentPosition < values.length - 1)
        {
            currentPosition += Math.ceil(inStepsize.get());
        }
        value = values[currentPosition];
    }
    valueText.textContent = value;
    outValue.set(value);
}

function onPrev()
{
    const values = inValues.get();
    let value = 0;
    if (!Array.isArray(values))
    {
        // no array given, increment/decrement according to params
        const currentValue = outValue.get();
        value = Math.max(currentValue - inStepsize.get(), inMin.get());
    }
    else
    {
        // user inputs an array, iterate fields, ignore min/max/stepsize
        if (currentPosition > 0)
        {
            currentPosition -= Math.ceil(inStepsize.get());
        }
        value = values[currentPosition];
    }
    valueText.textContent = value;
    outValue.set(value);
}

function onParentChanged()
{
    var parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(containerEl);
        siblingsPort.set(null);
        siblingsPort.set(parent);
    }
    else if (containerEl.parentElement)
    {
        // detach
        containerEl.parentElement.removeChild(containerEl);
    }
}

function onLabelTextChanged()
{
    var labelText = labelPort.get();
    label.textContent = labelText;

    if (CABLES.UI)
    {
        op.setTitle(labelText);
    }
}

function onDelete()
{
    removeElementFromDOM(containerEl);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}
