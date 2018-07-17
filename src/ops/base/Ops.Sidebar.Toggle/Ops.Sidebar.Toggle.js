const DEFAULT_VALUE_DEFAULT = true;

// inputs
var parentPort = op.inObject('link');
var labelPort = op.inValueString('Text', 'Toggle');
const inputValuePort = op.inValueBool('Input', DEFAULT_VALUE_DEFAULT);
const setDefaultValueButtonPort = op.inFunctionButton('Set Default');
var defaultValuePort = op.inValueBool('Default', DEFAULT_VALUE_DEFAULT);
defaultValuePort.setUiAttribs({ hidePort: true, greyout: true });

// outputs
var siblingsPort = op.outObject('childs');
var valuePort = op.outValue('Value', defaultValuePort.get());

// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar__toggle');
if(DEFAULT_VALUE_DEFAULT) {
    el.classList.add('sidebar__toggle--active');
}
el.addEventListener('click', onInputClick);
var label = document.createElement('div');
label.classList.add('sidebar__item-label');
var labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
var value = document.createElement('div');
value.textContent = DEFAULT_VALUE_DEFAULT;
value.classList.add('sidebar__item-value-label');
el.appendChild(value);
var input = document.createElement('div');
input.classList.add('sidebar__toggle-input');
el.appendChild(input);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
inputValuePort.onChange = onInputValuePortChanged;
op.onDelete = onDelete;
setDefaultValueButtonPort.onTriggered = setDefaultValue;

// functions

function setDefaultValue() {
  const defaultValue = inputValuePort.get();  
  defaultValuePort.set(defaultValue);
  valuePort.set(defaultValue);
  if(CABLES.UI){
    gui.patch().showOpParams(op); /* update DOM */
  }
}

function onInputClick() {
    el.classList.toggle('sidebar__toggle--active')
    if(el.classList.contains('sidebar__toggle--active')) {
        valuePort.set(true);
        inputValuePort.set(true);
        value.textContent = 'true';
    } else {
        valuePort.set(false);
        inputValuePort.set(false);
        value.textContent = 'false';
    }
    if(CABLES.UI){
        gui.patch().showOpParams(op); /* update DOM */
    }
}

function onInputValuePortChanged() {
    var inputValue = inputValuePort.get();
    if(inputValue) {
        el.classList.add('sidebar__toggle--active');
        valuePort.set(true);
        value.textContent = 'true';
    } else {
        el.classList.remove('sidebar__toggle--active');
        valuePort.set(false);
        value.textContent = 'false';
    }
}

function onDefaultValueChanged() {
    /*
    var defaultValue = defaultValuePort.get();
    if(defaultValue) {
        el.classList.add('sidebar__toggle--active');
        valuePort.set(true);
    } else {
        el.classList.remove('sidebar__toggle--active');
        valuePort.set(false);
    }
    */
}

function onLabelTextChanged() {
    var labelText = labelPort.get();
    label.textContent = labelText;
    if(CABLES.UI) {
        op.setTitle('Toggle: ' + labelText);    
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
