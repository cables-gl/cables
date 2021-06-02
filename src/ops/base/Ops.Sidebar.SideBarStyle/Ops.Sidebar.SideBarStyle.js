const parentPort = op.inObject("link"),
    labelPort = op.inString("Text", "Value"),
    inWidth=op.inInt("Width",220),
    siblingsPort = op.outObject("childs");

inWidth.onChange = setStyle;
parentPort.onChange = onParentChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

let sideBarEle=null;

function setStyle()
{
    if(!sideBarEle)return;

    console.log(sideBarEle);
    sideBarEle.style.setProperty("--sidebar-width", inWidth.get()+"px");
}



function onParentChanged()
{
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        // parent.parentElement.appendChild(el);
        siblingsPort.set(null);
        siblingsPort.set(parent);

        sideBarEle=parent.parentElement.parentElement;
        setStyle();

    }
    else
    {
        sideBarEle=null;
    }

}


function showElement(el)
{
    if (!el)return;
    el.style.display = "block";
}

function hideElement(el)
{
    if (!el)return;
    el.style.display = "none";
}

function onDelete()
{
}
