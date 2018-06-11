// inputs
const parentPort = op.inObject('Link');
const labelPort = op.inValueString('Text', 'Hex Color');
const inputValuePort = op.inValueString('Input', '#07F78C');
const setDefaultValueButtonPort = op.inFunctionButton('Set Default');
const defaultValuePort = op.inValueString('Default', '#07F78C');
defaultValuePort.setUiAttribs({ hidePort: true, greyout: true });

// outputs
const siblingsPort = op.outObject('Children');
// const valuePort = op.outValue('Result', defaultValuePort.get());
const redPort = op.outValue('Red', 0.0);
const greenPort = op.outValue('Green', 0.0);
const bluePort = op.outValue('Blue', 0.0);

// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar__color-picker');
var label = document.createElement('div');
label.classList.add('sidebar__item-label');
var labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
//var inputWrapper = document.createElement('div');
//inputWrapper.classList.add('sidebar__text-input-input-wrapper');
//el.appendChild(inputWrapper);
var input = document.createElement('input');
input.classList.add('sidebar__color-picker-input');
/* input.classList.add('jscolor'); */ /* color picker library */
input.setAttribute('type', 'text');
input.setAttribute('value', defaultValuePort.get());
//inputWrapper.appendChild(input);
el.appendChild(input);
input.addEventListener('input', onInput);
var colorInput = document.createElement('input');
colorInput.classList.add('sidebar__color-picker-color-input');
colorInput.setAttribute('type', 'color');
colorInput.setAttribute('value', defaultValuePort.get());
colorInput.addEventListener("change", onColorPickerChange, false);
el.appendChild(colorInput);
input.addEventListener('input', onInput);

onDefaultValueChanged(); /* initialize once */

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;
inputValuePort.onChange = onInputValuePortChange;
setDefaultValueButtonPort.onTriggered = setDefaultColor;

// functions

function setDefaultColor() {
    let hexCol = inputValuePort.get().trim();
    defaultValuePort.set(hexCol);
    if(CABLES.UI){
        gui.patch().showOpParams(op); /* update DOM */
    }
}

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

function hexToRgbNorm(hexColor) {
    if(!hexColor || hexColor.length !== 7) { return; }
    return hexColor
        .match(/[A-Za-z0-9]{2}/g)
        .map(function(v) { 
            return parseInt(v, 16) / 255;
        });

}

function onColorPickerChange(event) {
    setColorOutPorts(event.target.value);
    input.value = event.target.value;
    inputValuePort.set(event.target.value)
    if(CABLES.UI){
        gui.patch().showOpParams(op); /* update DOM */
    }
}

function onInput(ev) {
    var newValue = ev.target.value;
    if(newValue.length === 6 && newValue.charAt(0) !== '#') {
        newValue = '#' + newValue;
    }
    if(newValue.length === 7) {
        colorInput.value = newValue;
        setColorOutPorts(newValue);
        inputValuePort.set(newValue)
        if(CABLES.UI){
            gui.patch().showOpParams(op); /* update DOM */
        }
    }
}

// hex must be 7 digits
function setColorOutPorts(hex) {
    const colorArr = hexToRgbNorm(hex);
    redPort.set(colorArr[0]);
    greenPort.set(colorArr[1]);
    bluePort.set(colorArr[2]);
}

function onDefaultValueChanged() {
    var defaultValue = defaultValuePort.get();
    input.setAttribute('value', defaultValue);
    if(defaultValue) {
        if(defaultValue.length === 6 && defaultValue.charAt(0) !== '#') {
            defaultValue = '#' + defaultValue;
        }
        if(defaultValue.length === 7) {
            input.value = defaultValue;
            colorInput.value = defaultValue;    
            setColorOutPorts(defaultValue);
        }
    }
}

function onLabelTextChanged() {
    var labelText = labelPort.get();
    label.textContent = labelText;
    if(CABLES.UI) {
        op.setTitle('Text Input: ' + labelText);    
    }
}

function onParentChanged() {
    var parent = parentPort.get();
    if(parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(null);
        siblingsPort.set(parent);
    } else { // detach
        if(el.parentElement) {
            el.parentElement.removeChild(el);    
        }
    }
}

function showElement(el) {
    if(el) {
        el.style.display = 'block';
    }
}

function hideElement(el) {
    if(el) {
        el.style.display = 'none';
    }
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if(el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);    
    }
}
