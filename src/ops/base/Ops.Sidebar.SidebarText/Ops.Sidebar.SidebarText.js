// inputs
var parentPort = op.inObject('link');
var labelPort = op.inValueString('Text', 'Value');
var inId = op.inValueString('Id', '');

// outputs
var siblingsPort = op.outObject('childs');

// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar__text');
var label = document.createElement('div');
label.classList.add('sidebar__item-label');
var labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
op.onDelete = onDelete;

// functions

function onIdChanged()
{
    el.id=inId.get();
}

function onLabelTextChanged() {
    var labelText = labelPort.get();
    label.textContent = labelText;
    if(CABLES.UI) {
        if(labelText && typeof labelText === 'string') {
            op.setTitle('Text: ' + labelText.substring(0, 10)); // display first 10 characters of text in op title
        } else {
            op.setTitle('Text');
        }
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
