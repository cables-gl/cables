// constants
const DEFAULT_COLOR_HEX = "#07F78C";

// inputs
const parentPort = op.inObject("Link");
const labelPort = op.inString("Text", "Hex Color");
const defaultColorArr = hexToRgbNorm(DEFAULT_COLOR_HEX);
const inputRedPort = op.inValueSlider("Input Red", defaultColorArr[0]);
const inputGreenPort = op.inValueSlider("Input Green", defaultColorArr[1]);
const inputBluePort = op.inValueSlider("Input Blue", defaultColorArr[2]);
// const inputValuePort = op.inValueString('Input', DEFAULT_COLOR_HEX);
const setDefaultValueButtonPort = op.inTriggerButton("Set Default");
const defaultValuePort = op.inValueString("Default", DEFAULT_COLOR_HEX);
defaultValuePort.setUiAttribs({ "hidePort": true, "greyout": true });

// outputs
const siblingsPort = op.outObject("Children");
// const valuePort = op.outValue('Result', defaultValuePort.get());
const redPort = op.outValue("Red", 0.0);
const greenPort = op.outValue("Green", 0.0);
const bluePort = op.outValue("Blue", 0.0);

const outHex = op.outString("Hex", DEFAULT_COLOR_HEX);

// vars
const el = document.createElement("div");
el.addEventListener("dblclick", function ()
{
    let defaultValue = defaultValuePort.get();
    input.setAttribute("value", defaultValue);
    if (defaultValue)
    {
        if (defaultValue.length === 6 && defaultValue.charAt(0) !== "#")
        {
            defaultValue = "#" + defaultValue;
        }
        if (defaultValue.length === 7)
        {
            input.value = defaultValue;
            colorInput.value = defaultValue;
            setColorOutPorts(defaultValue);
        }
    }
});

el.classList.add("sidebar__item");
el.classList.add("sidebar__color-picker");
el.classList.add("sidebar__reloadable");

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelTextNode = document.createTextNode(labelPort.get());
label.appendChild(labelTextNode);
el.appendChild(label);
// var inputWrapper = document.createElement('div');
// inputWrapper.classList.add('sidebar__text-input-input-wrapper');
// el.appendChild(inputWrapper);
const input = document.createElement("input");
input.classList.add("sidebar__color-picker-input");
/* input.classList.add('jscolor'); */ /* color picker library */
input.setAttribute("type", "text");
input.setAttribute("value", defaultValuePort.get());
// inputWrapper.appendChild(input);
el.appendChild(input);
input.addEventListener("input", onInput);
const colorInput = document.createElement("input");
colorInput.classList.add("sidebar__color-picker-color-input");
colorInput.setAttribute("type", "color");
colorInput.setAttribute("value", defaultValuePort.get());
colorInput.addEventListener("change", onColorPickerChange, false);
el.appendChild(colorInput);
input.addEventListener("input", onInput);

onDefaultValueChanged(); /* initialize once */

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;
// inputValuePort.onChange = onInputValuePortChange;
setDefaultValueButtonPort.onTriggered = setDefaultColor;
inputRedPort.onChange = inputColorChanged;
inputGreenPort.onChange = inputColorChanged;
inputBluePort.onChange = inputColorChanged;

// functions

function inputColorChanged()
{
    const hex = getInputColorHex();
    // defaultValuePort.set(hex);
    colorInput.value = hex;
    input.value = hex;
    setColorOutPorts(hex);
}

/**
 * Returns the color of the op params ("input red", "input green", "input blue") as hex
 */
function getInputColorHex()
{
    const r = inputRedPort.get();
    const g = inputGreenPort.get();
    const b = inputBluePort.get();
    const hex = rgbNormToHex(r, g, b);
    return hex;
}

function setDefaultColor()
{
    // let hexCol = inputValuePort.get().trim();
    const hex = getInputColorHex();
    defaultValuePort.set(hex);
    outHex.set(hex);
    op.refreshParams();
}

/*
function onInputValuePortChange() {
    let hexCol = inputValuePort.get().trim();
    if(hexCol.length === 6 && hexCol.charAt(0) !== '#') {
        hexCol = '#' + hexCol;
    }
    if(hexCol.length === 7) {
        colorInput.value = hexCol;
        input.value = hexCol;
        setColorOutPorts(hexCol);
    }
}
*/

function hexToRgbNorm(hexColor)
{
    if (!hexColor || hexColor.length !== 7) { return; }
    return hexColor
        .match(/[A-Za-z0-9]{2}/g)
        .map(function (v)
        {
            return parseInt(v, 16) / 255;
        });
}

/**
 * Helper for rgbNormToHex / rgbToHex
 * Converts a number in range [0..255] to hex [00..FF] (with left padding)
 */
function componentToHex(c)
{
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/*
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
*/

/**
 * r, g, b in range [0..1]
 * @returns {string} e.g. "#ff0000"
 */
function rgbNormToHex(r, g, b)
{
    return "#" + componentToHex(Math.floor(255 * r)) + componentToHex(Math.floor(255 * g)) + componentToHex(Math.floor(255 * b));
}

function onColorPickerChange(event)
{
    const hex = event.target.value;
    setColorOutPorts(hex);
    input.value = hex;
    // inputValuePort.set(hex)
    outHex.set(hex);
    setInputsByHex(hex);
    op.refreshParams();
}

/**
 * Sets the op param color input ports by hex value (e.g. "#FF0000")
 * Does NOT update the gui
 */
function setInputsByHex(hex)
{
    const colorArr = hexToRgbNorm(hex);
    inputRedPort.set(colorArr[0]);
    inputGreenPort.set(colorArr[1]);
    inputBluePort.set(colorArr[2]);
    outHex.set(hex);
}

function onInput(ev)
{
    let newValue = ev.target.value;
    if (newValue.length === 6 && newValue.charAt(0) !== "#")
    {
        newValue = "#" + newValue;
    }
    if (newValue.length === 7)
    {
        colorInput.value = newValue;
        setColorOutPorts(newValue);
        // inputValuePort.set(newValue)
        setInputsByHex(newValue);
        outHex.set(newValue);
        op.refreshParams();
    }
}

// hex must be 7 digits
function setColorOutPorts(hex)
{
    const colorArr = hexToRgbNorm(hex);
    outHex.set(hex);
    redPort.set(colorArr[0]);
    greenPort.set(colorArr[1]);
    bluePort.set(colorArr[2]);
}

function onDefaultValueChanged()
{
    let defaultValue = defaultValuePort.get();
    input.setAttribute("value", defaultValue);
    if (defaultValue)
    {
        if (defaultValue.length === 6 && defaultValue.charAt(0) !== "#")
        {
            defaultValue = "#" + defaultValue;
        }
        if (defaultValue.length === 7)
        {
            input.value = defaultValue;
            colorInput.value = defaultValue;
            setColorOutPorts(defaultValue);
        }
    }
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;

    if (CABLES.UI)
    {
        op.setUiAttrib({ "extendTitle": labelText });
    }
}

function onParentChanged()
{
    const parent = parentPort.get();
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
