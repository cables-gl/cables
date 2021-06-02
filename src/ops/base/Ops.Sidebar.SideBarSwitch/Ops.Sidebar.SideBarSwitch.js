const parentPort = op.inObject("link"),
    inArr = op.inArray("Names"),
    siblingsPort = op.outObject("childs"),
    outIndex = op.outNumber("Index", -1);

let elTabActive = null;
const el = document.createElement("div");
el.classList.add("sidebar__item");
el.classList.add("sidebar_tabs");

parentPort.onChange = onParentChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

const tabEles = [];

inArr.onChange = () =>
{
    el.innerHTML = "";
    elTabActive = null;

    const arr = inArr.get();
    if (!arr) return;

    for (let i = 0; i < arr.length; i++)
    {
        const el = addTab(String(arr[i]));
        if (!elTabActive)setActiveTab(el);
    }
};

function addTab(title)
{
    const tabEle = document.createElement("div");
    tabEle.classList.add("sidebar_tab");
    tabEle.id = "tabEle" + tabEles.length;
    tabEle.innerHTML = title;
    tabEle.dataset.index = tabEles.length;

    tabEle.addEventListener("click", tabClicked);

    el.appendChild(tabEle);

    tabEles.push(tabEle);

    return tabEle;
}

function setActiveTab(el)
{
    elTabActive = el;
    console.log(el.dataset.index);
    outIndex.set(parseInt(el.dataset.index));
    el.classList.add("sidebar_tab_active");
}

function tabClicked(e)
{
    if (elTabActive) elTabActive.classList.remove("sidebar_tab_active");
    setActiveTab(e.target);
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
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}
