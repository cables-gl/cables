// inputs
var parentPort = op.inObject('link');
var buttonTextPort = op.inValueString('Text', 'Button');

// outputs
var siblingsPort = op.outObject('childs');
var buttonPressedPort = op.outTrigger('Pressed Trigger');

const inGreyOut=op.inBool("Grey Out",false);
const inVisible=op.inBool("Visible",true);


// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar--button');
var input = document.createElement('div');
input.classList.add('sidebar__button-input');
el.appendChild(input);
input.addEventListener('click', onButtonClick);
var inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);
op.toWorkNeedsParent('Ops.Sidebar.Sidebar');

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
op.onDelete = onDelete;

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


function onButtonClick() {
    buttonPressedPort.trigger();
}

function onButtonTextChanged() {
    var buttonText = buttonTextPort.get();
    input.textContent = buttonText;
    if(CABLES.UI) {
        op.setTitle('Button: ' + buttonText);
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
