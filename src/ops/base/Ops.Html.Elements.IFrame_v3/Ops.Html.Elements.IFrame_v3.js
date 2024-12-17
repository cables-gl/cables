const
    src = op.inString("URL", "https://undev.studio"),
    // inHash=op.inString("Location Hash"),
    elId = op.inString("ID"),
    active = op.inBool("Active", true),
    inStyle = op.inStringEditor("Style", "position:absolute;\nz-index:9999;\nborder:0;\nwidth:50%;\nheight:50%;"),
    outEle = op.outObject("Element");

op.setPortGroup("Attributes", [src, elId]);

let element = null;

op.onDelete = removeEle;

// inHash.onChange=()=>
// {
//     if(!element)return;

//     element.location.hash=inHash.get();
// };

op.onLoadedValueSet = op.init = () =>
{
    addElement();
    updateSoon();
    inStyle.onChange =
        src.onChange =
        elId.onChange = updateSoon;

    active.onChange = updateActive;
};

function addElement()
{
    if (!active.get()) return;
    if (element) removeEle();
    element = op.patch.getDocument().createElement("iframe");
    element.classList.add("cablesEle");
    updateAttribs();
    const parent = op.patch.cgl.canvas.parentElement;
    parent.appendChild(element);
    outEle.set(element);
}

let timeOut = null;

function updateSoon()
{
    clearTimeout(timeOut);
    timeOut = setTimeout(updateAttribs, 30);
}

function updateAttribs()
{
    if (!element) return;
    element.setAttribute("style", inStyle.get());
    element.setAttribute("src", src.get());
    element.setAttribute("id", elId.get());
    element.setAttribute("allowtransparency", "true");
    element.setAttribute("allowfullscreen", "allowfullscreen");
}

function removeEle()
{
    if (element && element.parentNode)element.parentNode.removeChild(element);
    element = null;
    outEle.set(element);
}

function updateActive()
{
    if (!active.get())
    {
        removeEle();
        return;
    }

    addElement();
}
