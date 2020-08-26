// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text", "Select File:");
const inId = op.inValueString("Id", "");
const inVisible = op.inBool("Visible", true);
// outputs

const siblingsPort = op.outObject("childs");
const outDataURL = op.outString("Data URL");

// vars
const el = document.createElement("div");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");
const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

const fileInputEle = document.createElement("input");
fileInputEle.type = "file";
fileInputEle.id = "file";
fileInputEle.name = "file";

fileInputEle.style["background-color"] = "transparent";
fileInputEle.style.width = "90%";
// fileInputEle.style.float = "left";


const elReset = document.createElement("div");
elReset.style.cursor = "pointer";
elReset.style.position = "absolute";
elReset.style.right = "10px";
elReset.style["margin-top"] = "5x";
elReset.innerHTML = "&nbsp;&nbsp;X";

el.appendChild(elReset);
el.appendChild(fileInputEle);

const imgEl = document.createElement("img");

fileInputEle.addEventListener("change", handleFileSelect, false);

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

elReset.addEventListener("click", () =>
{
    fileInputEle.value = "";
    outDataURL.set("");
});


function handleFileSelect(evt)
{
    const reader = new FileReader();

    reader.onabort = function (e)
    {
        op.log("File read cancelled");
    };

    reader.onload = function (e)
    {
        outDataURL.set(e.target.result);
    };

    reader.readAsDataURL(evt.target.files[0]);
}


// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// functions

function onIdChanged()
{
    el.id = inId.get();
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;
}

function onParentChanged()
{
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(null);
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
