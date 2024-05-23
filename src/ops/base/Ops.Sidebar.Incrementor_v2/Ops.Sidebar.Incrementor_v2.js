const
    parentPort = op.inObject("link"),
    labelPort = op.inString("Label", "Incrementor"),
    inMin = op.inValue("min", 0),
    inMax = op.inValue("max", 10),
    inStepsize = op.inValue("stepsize", 1),
    inDefault = op.inValue("Default", 0),
    inValues = op.inArray("Values"),
    inGreyOut = op.inBool("Grey Out", false),
    inTriggerInc = op.inTriggerButton("Increment"),
    inTriggerDec = op.inTriggerButton("Decrement"),

    inSetDefault = op.inTriggerButton("Set Default"),
    inReset = op.inTriggerButton("Reset"),

    siblingsPort = op.outObject("childs"),
    outValue = op.outNumber("value"),
    outChanged = op.outTrigger("Changed");

inSetDefault.onTriggered = setDefaultValue;
let currentPosition = 0;

op.setPortGroup("Trigger", [inTriggerDec, inTriggerInc]);

const containerEl = document.createElement("div");
containerEl.dataset.op = op.id;
containerEl.classList.add("cablesEle");
containerEl.classList.add("sidebar__item");
const label = document.createElement("div");
label.classList.add("sidebar__item-label");
label.addEventListener("dblclick", function ()
{
    outValue.set(inDefault.get());
    outChanged.trigger();
});

inTriggerInc.onTriggered = onNext;
inTriggerDec.onTriggered = onPrev;

const labelTextEl = document.createTextNode(labelPort.get());
label.appendChild(labelTextEl);
containerEl.appendChild(label);

const innerContainer = document.createElement("span");
innerContainer.classList.add("sidebar__item__right");

// value
const valueEl = document.createElement("span");
valueEl.style.marginRight = "10px";

let valueText = document.createTextNode(inMin.get());
if (Array.isArray(inValues.get()))
{
    valueText = document.createTextNode(inValues.get()[currentPosition]);
}

valueEl.appendChild(valueText);
innerContainer.appendChild(valueEl);

// previous
const prevEl = document.createElement("span");
prevEl.classList.add("sidebar--button");
prevEl.style.marginRight = "3px";
const prevInput = document.createElement("div");
prevInput.classList.add("sidebar__button-input");
prevInput.classList.add("minus");
prevEl.appendChild(prevInput);
prevInput.addEventListener("click", onPrev);
const prevText = document.createTextNode("-");
prevInput.appendChild(prevText);
innerContainer.appendChild(prevEl);

// next
const nextEl = document.createElement("span");
nextEl.classList.add("sidebar--button");
const nextInput = document.createElement("div");
nextInput.classList.add("sidebar__button-input");
nextInput.classList.add("plus");
nextEl.appendChild(nextInput);
nextInput.addEventListener("click", onNext);
const nextText = document.createTextNode("+");
nextInput.appendChild(nextText);

innerContainer.appendChild(nextEl);
containerEl.appendChild(innerContainer);

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
containerEl.appendChild(greyOut);
greyOut.style.display = "none";

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

function setDefaultValue()
{
    inDefault.set(outValue.get());
    op.refreshParams();
}

// events
parentPort.onChange = onParentChanged;
inValues.onChange = onValueChange;
labelPort.onChange = onLabelTextChanged;
op.onDelete = onDelete;

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

op.onLoaded = op.onInit = function ()
{
    if (Array.isArray(inValues.get()))
    {
        inDefault.setUiAttribs({ "greyout": true });
    }
    else
    {
        outValue.set(inDefault.get());
        valueText.textContent = inDefault.get();
        outChanged.trigger();
    }
};

inReset.onTriggered = () =>
{
    outValue.set(inDefault.get());
    outChanged.trigger();
    valueText.textContent = inDefault.get();
};

function onValueChange()
{
    const values = inValues.get();
    let value = inMin.get();
    if (Array.isArray(values))
    {
        value = values[currentPosition];
        inMin.setUiAttribs({ "greyout": true });
        inMax.set(values.length - 1);
        inMax.setUiAttribs({ "greyout": true });
        inStepsize.setUiAttribs({ "greyout": true });
        inStepsize.set(1);
        inDefault.setUiAttribs({ "greyout": true });
        inDefault.set(0);
    }
    else
    {
        inMin.setUiAttribs({ "greyout": false });
        inMax.setUiAttribs({ "greyout": false });
        inStepsize.setUiAttribs({ "greyout": false });
        inDefault.setUiAttribs({ "greyout": false });
    }
    outValue.set(value);
    outChanged.trigger();
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
    outChanged.trigger();
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
    outChanged.trigger();
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(containerEl);
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
    const labelText = labelPort.get();
    label.textContent = labelText;

    if (CABLES.UI) op.setUiAttrib({ "extendTitle": labelText });
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
