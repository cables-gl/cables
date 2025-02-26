const
    parentPort = op.inObject("link"),
    inElement = op.inObject("Child Element", "element"),
    inItemStyle = op.inBool("Border", true),
    inVisible = op.inBool("Visible", true),
    siblingsPort = op.outObject("childs");

const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");

parentPort.onChange = onParentChanged;
inElement.onChange = updateChild;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

let oldEle = null;

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

inItemStyle.onChange = () =>
{
    if (inItemStyle.get())
        el.classList.add("sidebar__item");
    else
        el.classList.remove("sidebar__item");
};

function updateChild()
{
    const ele = inElement.get();
    if (ele)
    {
        if (oldEle != ele && ele && ele.style)
        {
            el.innerHTML = "";
            el.appendChild(ele);
        }
        if (ele.getBoundingClientRect)
        {
            const rect = ele.getBoundingClientRect();
            el.style.height = rect.height + "px";
        }
    }
    else
    {
        el.innerHTML = "";
        el.style.height = "1px";
    }
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
        if (el.parentElement) el.parentElement.removeChild(el);
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild) el.parentNode.removeChild(el);
}
