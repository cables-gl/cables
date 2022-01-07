// inputs
let parentPort = op.inObject("link");
let inId = op.inValueString("Id", "");
let inUpdate = op.inTriggerButton("update");

// outputs
let siblingsPort = op.outObject("childs");

// vars
let el = document.createElement("div");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");
let label = document.createElement("div");
// label.classList.add('sidebar__item-label');

el.appendChild(label);

// events
parentPort.onChange = onParentChanged;
inUpdate.onTriggered = update;

inId.onChange = onIdChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

update();

// functions

function onIdChanged()
{
    el.id = inId.get();
}

function update()
{
    // var labelText = labelPort.get();
    // label.textContent = labelText;
    // if(CABLES.UI) {
    //     if(labelText && typeof labelText === 'string') {
    //         op.setTitle('Text: ' + labelText.substring(0, 10)); // display first 10 characters of text in op title
    //     } else {
    //         op.setTitle('Text');
    //     }
    // }

    let vars = op.patch.getVars();
    let html = "<table style=\"font-size:13px;\">";
    for (let ki in vars)
    {
        let v = vars[ki].getValue();

        if (typeof v == "object") v = "[object]";
        html += "<tr><td>" + ki + "</td><td><b>" + v + "</b></td></tr>";
    }
    html += "</table>";

    label.innerHTML = html;
}

function onParentChanged()
{
    siblingsPort.set(null);
    let parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}
