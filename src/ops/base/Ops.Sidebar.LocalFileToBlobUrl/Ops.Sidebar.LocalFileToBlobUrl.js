const
    parentPort = op.inObject("link", "element"),
    labelPort = op.inString("Text", "Select File:"),
    inLabelText = op.inString("Button Text", "Choose File"),
    inAccept = op.inString("Accept Files", ""),
    inMultiple = op.inBool("Allow Multiple Files", false),
    inId = op.inValueString("Id", ""),
    inVisible = op.inBool("Visible", true),
    inGreyOut = op.inBool("Grey Out", false),
    inOpenDialog = op.inTriggerButton("Show Dialog"),
    reset = op.inTriggerButton("Reset"),

    siblingsPort = op.outObject("childs"),
    outBlobUrl = op.outString("Blob URL"),
    outFilename = op.outString("Filename"),
    outObject = op.outObject("File Object"),
    outNumFiles = op.outNumber("Num Files"),
    outBlobUrls = op.outArray("Blob URLs"),
    outFilenames = op.outArray("Filenames"),
    outFileChanged = op.outTrigger("File Changed");

outBlobUrl.ignoreValueSerialize = true;

let blobUrls = [];

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
fileInputButton.style["padding-left"] = "5px";
fileInputButton.style["padding-right"] = "5px";
fileInputButton.style.width = "80%";
fileInputButton.style["text-overflow"] = "ellipsis";
fileInputButton.style.overflow = "hidden";
fileInputButton.style["white-space"] = "nowrap";

el.appendChild(elReset);
el.appendChild(fileInputButton);
el.appendChild(fileInputEle);

fileInputEle.addEventListener("change", handleFileSelect, false);

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inMultiple.onChange = () =>
{
    if (inMultiple.get()) fileInputEle.setAttribute("multiple", "multiple");
    else fileInputEle.removeAttribute("multiple");
};

inAccept.onChange = () =>
{
    fileInputEle.accept = inAccept.get();
};

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

reset.onTriggered = onReset;
elReset.addEventListener("click", onReset);

parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

function revokeUrls()
{
    for (let i = 0; i < blobUrls.length; i++) URL.revokeObjectURL(blobUrls[i]);
    blobUrls = [];
}

function onReset()
{
    fileInputEle.value = "";
    revokeUrls();
    fileInputButton.innerHTML = inLabelText.get();
    outBlobUrl.set("");
    outFilename.set("");
    outObject.setRef(null);
    outNumFiles.set(0);
    outBlobUrls.setRef([]);
    outFilenames.setRef([]);
    outFileChanged.trigger();
}

function handleFileSelect(evt)
{
    const files = evt.target.files;
    if (!files.length)
    {
        onReset();
        return;
    }

    revokeUrls();
    const filenames = [];
    for (let i = 0; i < files.length; i++)
    {
        blobUrls.push(URL.createObjectURL(files[i]));
        filenames.push(files[i].name);
    }

    if (files.length == 1) fileInputButton.innerHTML = files[0].name;
    else fileInputButton.innerHTML = files.length + " files selected";

    outNumFiles.set(files.length);
    outFilename.set(files[0].name);
    outObject.setRef(files[0]);
    outFilenames.setRef(filenames);
    outBlobUrls.setRef(blobUrls.slice());
    outBlobUrl.set(blobUrls[0]);
    outFileChanged.trigger();
}

function onIdChanged()
{
    el.id = inId.get();
}

function onLabelTextChanged()
{
    label.textContent = labelPort.get();
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
    else if (el.parentElement)
    {
        el.parentElement.removeChild(el);
    }
}

function onDelete()
{
    revokeUrls();
    if (el.parentNode) el.parentNode.removeChild(el);
}
