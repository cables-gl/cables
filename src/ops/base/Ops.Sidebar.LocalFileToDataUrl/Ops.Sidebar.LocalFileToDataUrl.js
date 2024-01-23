// inputs
const
    parentPort = op.inObject("link", "element"),
    labelPort = op.inString("Text", "Select File:"),
    inLabelText = op.inString("Button Text", "Choose File"),
    inId = op.inValueString("Id", ""),
    inVisible = op.inBool("Visible", true),
    inGreyOut = op.inBool("Grey Out", false),
    inOpenDialog = op.inTriggerButton("Show Dialog"),
    reset = op.inTriggerButton("Reset"),

    siblingsPort = op.outObject("childs"),
    outDataURL = op.outString("Data URL"),
    outFilename = op.outString("Filename"),
    outObject = op.outObject("File Object");

outDataURL.ignoreValueSerialize = true;

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
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
fileInputEle.style.display = "none";
// fileInputEle.style.float = "left";

const elReset = document.createElement("div");
elReset.style.cursor = "pointer";
elReset.style.position = "absolute";
elReset.style.right = "10px";
elReset.style["margin-top"] = "15px";
elReset.innerHTML = "&nbsp;&nbsp;✕";

const fileInputButton = document.createElement("div");
fileInputButton.classList.add("sidebar__button-input");
fileInputButton.innerHTML = inLabelText.get();

fileInputButton.onclick = () => { fileInputEle.click(); };
inOpenDialog.onTriggered = () => { fileInputButton.click(); };
fileInputButton.style["margin-top"] = "10px";
fileInputButton.style.width = "80%";

el.appendChild(elReset);
el.appendChild(fileInputButton);
el.appendChild(fileInputEle);

const imgEl = document.createElement("img");

fileInputEle.addEventListener("change", handleFileSelect, false);

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inLabelText.onChange = () =>
{
    fileInputButton.innerHTML = inLabelText.get();
};

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onReset()
{
    fileInputEle.value = "";
    outDataURL.set("");
}

reset.onTriggered = onReset;
elReset.addEventListener("click", onReset);

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

    if (evt.target.files[0])
    {
        reader.readAsDataURL(evt.target.files[0]);
        outFilename.set(evt.target.files[0].name);
        outObject.set(evt.target.files[0]);
    }
    else
    {
        outDataURL.set("");
        outFilename.set("");
        outObject.set(null);
    }
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
    siblingsPort.set(null);
    const parent = parentPort.get();
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
