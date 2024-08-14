const parentPort = op.inObject("link"),
    inArr = op.inArray("Names"),
    inStyle = op.inSwitch("Style", ["Tabs", "Switch"], "Switch"),
    labelPort = op.inString("Text", "Switch"),

    inInput = op.inInt("Input", 0),

    setDefaultValueButtonPort = op.inTriggerButton("Set Default"),
    inGreyOut = op.inBool("Grey Out", false),
    inDefault = op.inValue("Default", 0),

    siblingsPort = op.outObject("childs"),
    outIndex = op.outNumber("Index", -1),
    outStr = op.outString("String");

let elTabActive = null;
const el = document.createElement("div");
el.classList.add("sidebar__item");
el.dataset.op = op.id;
el.classList.add("cablesEle");
inDefault.setUiAttribs({ "greyout": true });

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

const switchGroup = document.createElement("div");
el.appendChild(switchGroup);

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

parentPort.onChange = onParentChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");
op.setPortGroup("Default Item", [inDefault, setDefaultValueButtonPort]);
const tabEles = [];

inArr.onChange = rebuildHtml;
inStyle.onChange = updateStyle;
updateStyle();

labelPort.onChange = () =>
{
    label.innerHTML = labelPort.get();
};

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

function rebuildHtml()
{
    tabEles.length = 0;
    switchGroup.innerHTML = "";
    elTabActive = null;

    const arr = inArr.get();
    if (!arr) return;

    for (let i = 0; i < arr.length; i++)
    {
        const el = addTab(String(arr[i]));
        if (i == inDefault.get())setActiveTab(el);
    }
}

setDefaultValueButtonPort.onTriggered = () =>
{
    inDefault.set(outIndex.get());
    op.refreshParams();
};

function updateStyle()
{
    if (inStyle.get() == "Tabs")
    {
        el.classList.add("sidebar_tabs");
        switchGroup.classList.remove("sidebar_switchs");
        label.style.display = "none";
    }
    else
    {
        el.classList.remove("sidebar_tabs");
        switchGroup.classList.add("sidebar_switchs");
        label.style.display = "inline-block";
    }

    labelPort.setUiAttribs({ "greyout": inStyle.get() == "Tabs" });

    rebuildHtml();
}

function addTab(title)
{
    const tabEle = document.createElement("div");

    if (inStyle.get() == "Tabs") tabEle.classList.add("sidebar_tab");
    else tabEle.classList.add("sidebar_switch");

    tabEle.id = "tabEle" + tabEles.length;
    tabEle.innerHTML = title;
    tabEle.dataset.index = tabEles.length;
    tabEle.dataset.txt = title;

    tabEle.addEventListener("click", tabClicked);

    switchGroup.appendChild(tabEle);

    tabEles.push(tabEle);

    return tabEle;
}

inInput.onChange = () =>
{
    if (tabEles.length > inInput.get())
        tabClicked({ "target": tabEles[inInput.get()] });
    // setActiveTab(tabEles[inInput.get()]);
};

function setActiveTab(el)
{
    if (el)
    {
        elTabActive = el;
        outIndex.set(parseInt(el.dataset.index));
        outStr.set(el.dataset.txt);

        if (inStyle.get() == "Tabs") el.classList.add("sidebar_tab_active");
        else el.classList.add("sidebar_switch_active");
    }
}

function tabClicked(e)
{
    if (elTabActive)
        if (inStyle.get() == "Tabs") elTabActive.classList.remove("sidebar_tab_active");
        else elTabActive.classList.remove("sidebar_switch_active");
    setActiveTab(e.target);
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
