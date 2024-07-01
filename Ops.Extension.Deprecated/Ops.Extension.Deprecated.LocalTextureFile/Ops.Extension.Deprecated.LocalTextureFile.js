// inputs
let parentPort = op.inObject("link"),
    labelPort = op.inString("Text", "Select File:"),
    inId = op.inValueString("Id", ""),

    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge");

// outputs
let siblingsPort = op.outObject("childs");
const outTex = op.outTexture("Texture");

// vars
let el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");
let label = document.createElement("div");
label.classList.add("sidebar__item-label");
let labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

const fileInputEle = document.createElement("input");
fileInputEle.type = "file";
fileInputEle.id = "file";
fileInputEle.name = "file";
fileInputEle.style.width = "95%";
el.appendChild(fileInputEle);

outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));

const imgEl = document.createElement("img");

tfilter.onChange = wrap.onChange = () =>
{
    fileInputEle.dispatchEvent(new Event("change"));
};
fileInputEle.addEventListener("change", handleFileSelect, false);

function handleFileSelect(evt)
{
    const reader = new FileReader();

    reader.onabort = function (e)
    {
        op.log("File read cancelled");
    };

    reader.onload = function (e)
    {
        let image = new Image();
        image.onerror = function (e)
        {
            outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
            op.log("image error", e);
        };
        image.onload = function (e)
        {
            let cgl_filter = CGL.Texture.FILTER_LINEAR;
            let cgl_wrap = CGL.Texture.WRAP_REPEAT;
            if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
            else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
            else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
            else if (tfilter.get() == "Anisotropic") cgl_filter = CGL.Texture.FILTER_ANISOTROPIC;

            if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
            if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
            if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

            let tex = CGL.Texture.createFromImage(op.patch.cgl, image, { "filter": cgl_filter, "wrap": cgl_wrap });
            outTex.set(tex);
        };
        image.src = e.target.result;
    };

    if (evt && evt.target && evt.target.files[0])
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
    let labelText = labelPort.get();
    label.textContent = labelText;
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
    if (el) el.style.display = "block";
}

function hideElement(el)
{
    if (el) el.style.display = "none";
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
