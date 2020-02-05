// inputs
const parentPort = op.inObject('Link');
const labelPort = op.inString('Text', 'Text');
const defaultValuePort = op.inString('Default', '');
const inTextArea=op.inBool("TextArea",false);
const inGreyOut=op.inBool("Grey Out",false);
const inVisible=op.inBool("Visible",true);

// outputs
const siblingsPort = op.outObject('Children');
const valuePort = op.outString('Result', defaultValuePort.get());

// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar__text-input');
var label = document.createElement('div');
label.classList.add('sidebar__item-label');
var labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
//var inputWrapper = document.createElement('div');
//inputWrapper.classList.add('sidebar__text-input-input-wrapper');
//el.appendChild(inputWrapper);

var input=null;
creatElement();

//inputWrapper.appendChild(input);
op.toWorkPortsNeedToBeLinked(parentPort);

inTextArea.onChange=creatElement;

function creatElement()
{
    if(input)input.remove();
    if(!inTextArea.get())
    {
        input = document.createElement('input');
    }
    else
    {
        input = document.createElement('textarea');
        onDefaultValueChanged();

    }

    input.classList.add('sidebar__text-input-input');
    input.setAttribute('type', 'text');
    input.setAttribute('value', defaultValuePort.get());
    el.appendChild(input);
    input.addEventListener('input', onInput);
}

var greyOut = document.createElement('div');
greyOut.classList.add('sidebar__greyout');
el.appendChild(greyOut);
greyOut.style.display="none";

inGreyOut.onChange=function()
{
    greyOut.style.display= inGreyOut.get() ? "block" : "none";
};

inVisible.onChange=function()
{
    el.style.display= inVisible.get() ? "block" : "none";
};


// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;

// functions

function onInput(ev) {
    valuePort.set(ev.target.value);
}

function onDefaultValueChanged() {
    var defaultValue = defaultValuePort.get();
    valuePort.set(defaultValue);
    input.value = defaultValue;
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
