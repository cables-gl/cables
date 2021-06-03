const parentPort = op.inObject("link"),
    inWidth = op.inInt("Width", 220),
    inColorSpecial = op.inString("Special Color", "#07f78c"),

    siblingsPort = op.outObject("childs");

inColorSpecial.onChange =
inWidth.onChange = setStyle;

parentPort.onChange = onParentChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

let sideBarEle = null;

function setStyle()
{
    if (!sideBarEle) return;

    // console.log(sideBarEle);
    sideBarEle.style.setProperty("--sidebar-width", inWidth.get() + "px");

    sideBarEle.style.setProperty("--sidebar-color", inColorSpecial.get());

    op.patch.emitEvent("sidebarStylesChanged");
}

function onParentChanged()
{
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        siblingsPort.set(null);
        siblingsPort.set(parent);

        sideBarEle = parent.parentElement.parentElement;
        setStyle();
    }
    else
    {
        sideBarEle = null;
    }
}

function showElement(el)
{
    if (!el) return;
    el.style.display = "block";
}

function hideElement(el)
{
    if (!el) return;
    el.style.display = "none";
}

function onDelete()
{
}
