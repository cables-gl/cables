const
    parentPort = op.inObject("link"),
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif"]),
    siblingsPort = op.outObject("childs"),
    outImage = op.outObject("Image Element", null, "element");

const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");
const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createElement("div");
label.appendChild(labelText);
el.appendChild(label);
let imageEle = null;
parentPort.onChange = onParentChanged;
filename.onChange = onFilenameChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

function onFilenameChanged()
{
    let fileUrl = op.patch.getFilePath(String(filename.get()));
    if (!fileUrl)
    {
        label.innerHTML = "";
        return;
    }

    if (!imageEle)
    {
        let base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        if (base64regex.test(fileUrl))
        {
            fileUrl = "data:image;base64," + fileUrl;
        }

        label.innerHTML = "<img style=\"max-width:100%\"/>";
        imageEle = label.children[0];
        outImage.setRef(imageEle);
    }

    imageEle.setAttribute("src", fileUrl);
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
    else if (el.parentElement) el.parentElement.removeChild(el);
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
    if (el && el.parentNode && el.parentNode.removeChild) el.parentNode.removeChild(el);
}
