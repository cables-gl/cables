// inputs
const parentPort = op.inObject('Link');
const labelPort = op.inValueString('Text', 'Value');
const valuesPort = op.inArray('Values');
const defaultValuePort = op.inValueString('Default', '');

// outputs
const siblingsPort = op.outObject('Children');
const valuePort = op.outValue('Result', defaultValuePort.get());
const outIndex = op.outNumber("Index");

// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar__select');
var label = document.createElement('div');
label.classList.add('sidebar__item-label');
var labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
var input = document.createElement('select');
input.classList.add('sidebar__select-select');
el.appendChild(input);
input.addEventListener('input', onInput);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;
valuesPort.onChange = onValuesPortChange;

var options=[];
// functions

function onValuesPortChange() {
    // remove all children
    while (input.lastChild) {
        input.removeChild(input.lastChild);
    }
    options = valuesPort.get();
    var defaultValue = defaultValuePort.get();
    if(options) {
        options.forEach(function(option) {
            const optionEl = document.createElement('option');
            optionEl.setAttribute('value', option);
            if(option === defaultValue) {
                optionEl.setAttribute('selected', '');
            }
            const textEl = document.createTextNode(option);
            optionEl.appendChild(textEl);
            input.appendChild(optionEl);
        });
    } else {
        valuePort.set('');
    }
    setSelectedProperty(); /* set the selected property for the default value */
}

function setSelectedProperty() {
    const defaultItem = defaultValuePort.get();
    const optionElements = input.querySelectorAll('option');
    optionElements.forEach(function(optionElement) {
        if(optionElement.value === defaultItem) {
            optionElement.setAttribute('selected', '');
        } else {
            optionElement.removeAttribute('selected');
        }
    });
}

function onInput(ev) {
    valuePort.set(ev.target.value);
    outIndex.set(options.indexOf(ev.target.value));
}

function onDefaultValueChanged() {
    var defaultValue = defaultValuePort.get();
    valuePort.set(defaultValue);
    // input.value = defaultValue;
    setSelectedProperty();
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
