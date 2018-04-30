// inputs
var parentPort = op.inObject('link');
var labelPort = op.inValueString('Text', 'Value');
var valuePort = op.inValueBool('Value', 0);

// outputs
var siblingsPort = op.outObject('childs');

// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar__value-display');
var label = document.createElement('div');
label.classList.add('sidebar__item-label');
var labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
var value = document.createElement('div');
value.textContent = valuePort.get();
value.classList.add('sidebar__item-value-label');
el.appendChild(value);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
valuePort.onChange = onValueChanged;
op.onDelete = onDelete;

// functions

function onValueChanged() {
    value.textContent = valuePort.get();
}

function onLabelTextChanged() {
    var labelText = labelPort.get();
    label.textContent = labelText;
    if(CABLES.UI) {
        op.setTitle('Value: ' + labelText);    
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
    if(el && el.parentNode && parentNode.removeChild) {
        el.parentNode.removeChild(el);    
    }
}
