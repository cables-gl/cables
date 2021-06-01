const parentPort = op.inObject("link"),
    labelPort = op.inString("Text", "Value"),
    inId = op.inValueString("Id", ""),
    siblingsPort = op.outObject("childs"),
    outIndex=op.outNumber("Index",-1);

let elTabActive=null;
const el = document.createElement("div");
el.classList.add("sidebar__item");
el.classList.add("sidebar_tabs");

parentPort.onChange = onParentChanged;
inId.onChange = onIdChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

const tabEles=[];

addTab("BASIC");
addTab("SPHERE");
addTab("TEXT");
addTab("EXPORT");

function onIdChanged()
{
    el.id = inId.get();
}

function addTab(title)
{
    const tabEle=document.createElement("div");
    tabEle.classList.add("sidebar_tab");
    tabEle.id="tabEle"+tabEles.length;
    tabEle.innerHTML=title;
    tabEle.dataset.index=tabEles.length;

    tabEle.addEventListener("click",tabClicked);

    el.appendChild(tabEle);

    tabEles.push(tabEle);

    return tabEle;
}

function tabClicked(e)
{
    if(elTabActive) elTabActive.classList.remove("sidebar_tab_active");
    elTabActive=e.target;
    console.log(e.target.dataset.index);
    outIndex.set(parseInt(e.target.dataset.index));
    e.target.classList.add("sidebar_tab_active");
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
    {
        if (el.parentElement)
            el.parentElement.removeChild(el);
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
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}
