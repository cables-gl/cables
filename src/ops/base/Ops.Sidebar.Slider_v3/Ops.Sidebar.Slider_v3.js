// constants
const STEP_DEFAULT = 0.00001;

// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text", "Slider");
const minPort = op.inValue("Min", 0);
const maxPort = op.inValue("Max", 1);
const stepPort = op.inValue("Step", STEP_DEFAULT);
const labelSuffix = op.inString("Suffix", "");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

const inputValuePort = op.inValue("Input", 0.5);
const setDefaultValueButtonPort = op.inTriggerButton("Set Default");
const reset = op.inTriggerButton("Reset");

let parent = null;

const defaultValuePort = op.inValue("Default", 0.5);
defaultValuePort.setUiAttribs({ "hidePort": true, "greyout": true });

// outputs
const siblingsPort = op.outObject("childs");
const valuePort = op.outNumber("Result", defaultValuePort.get());

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");
op.setPortGroup("Range", [minPort, maxPort, stepPort]);
op.setPortGroup("Display", [inGreyOut, inVisible]);

// vars
const el = document.createElement("div");
el.addEventListener("dblclick", function ()
{
    valuePort.set(parseFloat(defaultValuePort.get()));
    inputValuePort.set(parseFloat(defaultValuePort.get()));
    setValueFieldValue(defaultValuePort.get());
});

el.dataset.op = op.id;
el.classList.add("cablesEle");

el.classList.add("sidebar__item");
el.classList.add("sidebar__slider");
el.classList.add("sidebar__reloadable");

op.patch.on("sidebarStylesChanged", () => { updateActiveTrack(); });

const label = document.createElement("div");
label.classList.add("sidebar__item-label");

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

const value = document.createElement("input");
value.value = defaultValuePort.get();
value.classList.add("sidebar__text-input-input");
value.setAttribute("type", "text");

value.oninput = onTextInputChanged;
el.appendChild(value);

const suffixEle = document.createElement("span");
// setValueFieldValue(defaultValuePort).get();
// value.setAttribute("type", "text");
// value.oninput = onTextInputChanged;

el.appendChild(suffixEle);

labelSuffix.onChange = () =>
{
    suffixEle.innerHTML = labelSuffix.get();
};

const inputWrapper = document.createElement("div");
inputWrapper.classList.add("sidebar__slider-input-wrapper");
el.appendChild(inputWrapper);

const activeTrack = document.createElement("div");
activeTrack.classList.add("sidebar__slider-input-active-track");
inputWrapper.appendChild(activeTrack);
const input = document.createElement("input");
input.classList.add("sidebar__slider-input");
input.setAttribute("min", minPort.get());
input.setAttribute("max", maxPort.get());
input.setAttribute("type", "range");
input.setAttribute("step", stepPort.get());
input.setAttribute("value", defaultValuePort.get());
input.style.display = "block"; /* needed because offsetWidth returns 0 otherwise */
inputWrapper.appendChild(input);

updateActiveTrack();
input.addEventListener("input", onSliderInput);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inputValuePort.onChange = onInputValuePortChanged;
defaultValuePort.onChange = onDefaultValueChanged;
setDefaultValueButtonPort.onTriggered = onSetDefaultValueButtonPress;
minPort.onChange = onMinPortChange;
maxPort.onChange = onMaxPortChange;
stepPort.onChange = stepPortChanged;
op.onDelete = onDelete;

// op.onLoadedValueSet=function()
op.onLoaded = op.onInit = function ()
{
    if (op.patch.config.sidebar)
    {
        op.patch.config.sidebar[labelPort.get()];
        valuePort.set(op.patch.config.sidebar[labelPort.get()]);
    }
    else
    {
        valuePort.set(parseFloat(defaultValuePort.get()));
        inputValuePort.set(parseFloat(defaultValuePort.get()));
        // onInputValuePortChanged();
    }
};

reset.onTriggered = function ()
{
    const newValue = parseFloat(defaultValuePort.get());
    valuePort.set(newValue);
    setValueFieldValue(newValue);
    setInputFieldValue(newValue);
    inputValuePort.set(newValue);
    updateActiveTrack();
};

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onTextInputChanged(ev)
{
    let newValue = parseFloat(ev.target.value);
    if (isNaN(newValue)) newValue = 0;
    const min = minPort.get();
    const max = maxPort.get();
    if (newValue < min) { newValue = min; }
    else if (newValue > max) { newValue = max; }
    // setInputFieldValue(newValue);
    valuePort.set(newValue);
    updateActiveTrack();
    inputValuePort.set(newValue);
    op.refreshParams();
}

function onInputValuePortChanged()
{
    let newValue = parseFloat(inputValuePort.get());
    const minValue = minPort.get();
    const maxValue = maxPort.get();
    if (newValue > maxValue) { newValue = maxValue; }
    else if (newValue < minValue) { newValue = minValue; }
    // setValueFieldValue(newValue);
    setInputFieldValue(newValue);
    valuePort.set(newValue);
    updateActiveTrack();
}

function onSetDefaultValueButtonPress()
{
    let newValue = parseFloat(inputValuePort.get());
    const minValue = minPort.get();
    const maxValue = maxPort.get();
    if (newValue > maxValue) { newValue = maxValue; }
    else if (newValue < minValue) { newValue = minValue; }
    setValueFieldValue(newValue);
    setInputFieldValue(newValue);
    valuePort.set(newValue);
    defaultValuePort.set(newValue);
    op.refreshParams();

    updateActiveTrack();
}

function onSliderInput(ev)
{
    ev.preventDefault();
    ev.stopPropagation();
    setValueFieldValue(ev.target.value);
    const inputFloat = parseFloat(ev.target.value);
    valuePort.set(inputFloat);
    inputValuePort.set(inputFloat);
    op.refreshParams();

    updateActiveTrack();
    return false;
}

function stepPortChanged()
{
    const step = stepPort.get();
    input.setAttribute("step", step);
    updateActiveTrack();
}

function updateActiveTrack(val)
{
    let valueToUse = parseFloat(input.value);
    if (typeof val !== "undefined") valueToUse = val;
    let availableWidth = activeTrack.parentElement.getBoundingClientRect().width || 220;
    if (parent) availableWidth = parseInt(getComputedStyle(parent.parentElement).getPropertyValue("--sidebar-width")) - 20;

    const trackWidth = CABLES.map(
        valueToUse,
        parseFloat(input.min),
        parseFloat(input.max),
        0,
        availableWidth - 16 /* subtract slider thumb width */
    );
    activeTrack.style.width = trackWidth + "px";
}

function onMinPortChange()
{
    const min = minPort.get();
    input.setAttribute("min", min);
    updateActiveTrack();
}

function onMaxPortChange()
{
    const max = maxPort.get();
    input.setAttribute("max", max);
    updateActiveTrack();
}

function onDefaultValueChanged()
{
    const defaultValue = defaultValuePort.get();
    valuePort.set(parseFloat(defaultValue));
    onMinPortChange();
    onMaxPortChange();
    setInputFieldValue(defaultValue);
    setValueFieldValue(defaultValue);

    updateActiveTrack(defaultValue); // needs to be passed as argument, is this async?
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;
    if (CABLES.UI) op.setUiAttrib({ "extendTitle": labelText });
    value.setAttribute("aria-label", "slider " + labelPort.get());
    input.setAttribute("aria-label", "slider " + labelPort.get());
}

function onParentChanged()
{
    siblingsPort.set(null);
    parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else if (el.parentElement) el.parentElement.removeChild(el);

    updateActiveTrack();
}

function setValueFieldValue(v)
{
    value.value = v;
}

function setInputFieldValue(v)
{
    input.value = v;
}

function showElement(el)
{
    if (el)el.style.display = "block";
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
    if (el && el.parentNode && el.parentNode.removeChild) el.parentNode.removeChild(el);
}
