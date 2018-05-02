// inputs
var parentPort = op.inObject('link');
var buttonTextPort = op.inValueString('Text', 'Button');

// outputs
var siblingsPort = op.outObject('childs');
var buttonPressedPort = op.outFunction('Pressed Trigger');

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

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
op.onDelete = onDelete;

// functions

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
