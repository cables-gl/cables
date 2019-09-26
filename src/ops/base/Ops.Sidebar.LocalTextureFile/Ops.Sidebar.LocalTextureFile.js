// inputs
var parentPort = op.inObject('link');
var labelPort = op.inString('Text', 'Select File:');
var inId = op.inValueString('Id', '');

// outputs
var siblingsPort = op.outObject('childs');
const outTex=op.outTexture("Texture");

// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar__text');
var label = document.createElement('div');
label.classList.add('sidebar__item-label');
var labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

const fileInputEle = document.createElement('input');
fileInputEle.type="file";
fileInputEle.id="file";
fileInputEle.name="file";
fileInputEle.style.width="95%";
el.appendChild(fileInputEle);

const imgEl = document.createElement('img');

fileInputEle.addEventListener('change', handleFileSelect, false);

function handleFileSelect(evt)
{
    const reader = new FileReader();

    reader.onabort = function(e) {
        op.log('File read cancelled');
    };

    reader.onload = function(e)
    {
        var image = new Image();
        image.onerror=function(e)
        {
            op.log("image error",e);
        };
        image.onload=function(e)
        {
            var tex=CGL.Texture.createFromImage(op.patch.cgl,image,{});
            outTex.set(tex);
        };
        image.src = e.target.result;
    };

    reader.readAsDataURL(evt.target.files[0]);
}


// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent('Ops.Sidebar.Sidebar');

// functions

function onIdChanged()
{
    el.id=inId.get();
}

function onLabelTextChanged() {
    var labelText = labelPort.get();
    label.textContent = labelText;
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
