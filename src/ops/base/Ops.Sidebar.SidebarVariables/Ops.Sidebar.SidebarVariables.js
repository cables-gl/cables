// inputs
var parentPort = op.inObject('link');
var inId = op.inValueString('Id', '');
var inUpdate=op.inTriggerButton("update");

// outputs
var siblingsPort = op.outObject('childs');

// vars
var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar__text');
var label = document.createElement('div');
// label.classList.add('sidebar__item-label');

el.appendChild(label);

// events
parentPort.onChange = onParentChanged;
inUpdate.onTriggered=update;

inId.onChange = onIdChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent('Ops.Sidebar.Sidebar');

update();

// functions

function onIdChanged()
{
    el.id=inId.get();
}

function update() {
    // var labelText = labelPort.get();
    // label.textContent = labelText;
    // if(CABLES.UI) {
    //     if(labelText && typeof labelText === 'string') {
    //         op.setTitle('Text: ' + labelText.substring(0, 10)); // display first 10 characters of text in op title
    //     } else {
    //         op.setTitle('Text');
    //     }
    // }

    var vars= op.patch.getVars();
    var html='<table style="font-size:13px;">';
    for(var ki in vars)
    {
        var v=vars[ki].getValue();

        if(typeof v =='object') v="[object]";
        html+='<tr><td>'+ki+'</td><td><b>'+v+'</b></td></tr>';
    }
    html+='</table>';

    label.innerHTML=html;
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
