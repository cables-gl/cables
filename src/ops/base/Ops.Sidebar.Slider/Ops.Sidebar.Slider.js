// inputs
const parentPort = op.inObject('link');
const labelPort = op.inValueString('Text', 'Slider');
const minPort = op.inValue("Min", 0);
const maxPort = op.inValue("Max", 1);
const stepPort = op.inValue("Step", 0.01);
const inputValuePort = op.inValue('Input', 0.5);
const setDefaultValueButtonPort = op.inFunctionButton('Set Default');
const defaultValuePort = op.inValue('Default', 0.5);
defaultValuePort.setUiAttribs({ hidePort: true, greyout: true });

// outputs
const siblingsPort = op.outObject('childs');
const valuePort = op.outValue('Result', defaultValuePort.get());

// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar__slider');
var label = document.createElement('div');
label.classList.add('sidebar__item-label');
var labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
var value = document.createElement('div');
value.textContent = defaultValuePort.get();
value.classList.add('sidebar__item-value-label');
el.appendChild(value);
var inputWrapper = document.createElement('div');
inputWrapper.classList.add('sidebar__slider-input-wrapper');
el.appendChild(inputWrapper);
var activeTrack = document.createElement('div');
activeTrack.classList.add('sidebar__slider-input-active-track');
inputWrapper.appendChild(activeTrack);
var input = document.createElement('input');
input.classList.add('sidebar__slider-input');
input.setAttribute('min', minPort.get());
input.setAttribute('max', maxPort.get());
input.setAttribute('type', 'range');
input.setAttribute('step', stepPort.get());
input.setAttribute('value', defaultValuePort.get());
input.style.display = 'block'; /* needed because offsetWidth returns 0 otherwise */
inputWrapper.appendChild(input);
updateActiveTrack();
input.addEventListener('input', onSliderInput);

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

op.init=function()
{
    valuePort.set(parseFloat(defaultValuePort.get()));
};

// functions

function onInputValuePortChanged() {
    let newValue = parseFloat(inputValuePort.get());
    const minValue = minPort.get();
    const maxValue = maxPort.get();
    if(newValue > maxValue) { newValue = maxValue; }
    else if(newValue < minValue) { newValue = minValue; }
    value.textContent = newValue;
    input.value = newValue;
    valuePort.set(newValue);
    updateActiveTrack();
}

function onSetDefaultValueButtonPress() {
    let newValue = parseFloat(inputValuePort.get());
    const minValue = minPort.get();
    const maxValue = maxPort.get();
    if(newValue > maxValue) { newValue = maxValue; }
    else if(newValue < minValue) { newValue = minValue; }
    value.textContent = newValue;
    input.value = newValue;
    valuePort.set(newValue);
    defaultValuePort.set(newValue);
    if(CABLES.UI){
        gui.patch().showOpParams(op); /* update DOM */
    }
    updateActiveTrack();
}

function onSliderInput(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    value.textContent = ev.target.value;
    const inputFloat = parseFloat(ev.target.value);
    valuePort.set(inputFloat);
    inputValuePort.set(inputFloat);
    if(CABLES.UI){
        gui.patch().showOpParams(op); /* update DOM */
    }
    updateActiveTrack();
    return false;
}

function stepPortChanged() {
    var step = stepPort.get();
    input.setAttribute('step', step);
    updateActiveTrack();
}

function updateActiveTrack(val) {
    let valueToUse = parseFloat(input.value);
    if(typeof val !== 'undefined') {
        valueToUse = val;
    }
    // const availableWidth = input.offsetWidth; /* this returns 0 at the beginning, so cannot be used... */
    const availableWidth = 206;
    var trackWidth = CABLES.map(
        valueToUse,
        parseFloat(input.min), 
        parseFloat(input.max), 
        0, 
        availableWidth - 16 /* subtract slider thumb width */
    );
    // activeTrack.style.width = 'calc(' + percentage + '%' + ' - 9px)';
    activeTrack.style.width = trackWidth + 'px';
}

function onMinPortChange() {
    var min = minPort.get();
    input.setAttribute('min', min);
    updateActiveTrack();
}

function onMaxPortChange() {
    var max = maxPort.get();
    input.setAttribute('max', max);
    updateActiveTrack();
}

function onDefaultValueChanged() {
    var defaultValue = defaultValuePort.get();
    valuePort.set(parseFloat(defaultValue));
    onMinPortChange();
    onMaxPortChange();
    input.value = defaultValue;
    value.textContent = defaultValue;
    updateActiveTrack(defaultValue); // needs to be passed as argument, is this async?
}

function onLabelTextChanged() {
    var labelText = labelPort.get();
    label.textContent = labelText;
    if(CABLES.UI) {
        op.setTitle('Slider: ' + labelText);    
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
