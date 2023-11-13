// inputs
const parentPort = op.inObject("Link");
const labelPort = op.inString("Text", "Value");
const valuesPort = op.inArray("Values");
const defaultValuePort = op.inString("Default", "");
const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);
const inSize = op.inInt("Lines", 1);
const setDefaultValueButtonPort = op.inTriggerButton("Set Default");
setDefaultValueButtonPort.onTriggered = setDefault;

// outputs
const siblingsPort = op.outObject("Children");
const valuePort = op.outString("Result", defaultValuePort.get());
const outIndex = op.outNumber("Index");

defaultValuePort.setUiAttribs({ "title": "Input" });

// vars
const el = document.createElement("div");
el.addEventListener("dblclick", function ()
{
    valuePort.set(defaultValuePort.get());
    const optionElements = input.querySelectorAll("option");
    optionElements.forEach(function (optionElement, index)
    {
        if (optionElement.value.trim() === defaultValuePort.get())
        {
            optionElement.selected = true;
            outIndex.set(index);
        }
        else
        {
            optionElement.removeAttribute("selected");
        }
    });
});

el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__select");
el.classList.add("sidebar__reloadable");

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
const input = document.createElement("select");

input.classList.add("sidebar__select-select");
el.appendChild(input);
input.addEventListener("input", onInput);

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;
valuesPort.onChange = onValuesPortChange;

let options = [];
// functions

inSize.onChange = () =>
{
    input.setAttribute("size", inSize.get());
};

op.onLoaded = function ()
{
    valuePort.set(defaultValuePort.get());
};

function onValuesPortChange()
{
    // remove all children
    while (input.lastChild)
    {
        input.removeChild(input.lastChild);
    }
    options = valuesPort.get();
    const defaultValue = defaultValuePort.get();
    if (options)
    {
        options.forEach(function (option)
        {
            const optionEl = document.createElement("option");

            optionEl.setAttribute("value", option);
            if (option === defaultValue || option === valuePort.get())
            {
                optionEl.setAttribute("selected", "");
            }
            const textEl = document.createTextNode(option);
            optionEl.appendChild(textEl);
            input.appendChild(optionEl);
        });
    }
    else
    {
        valuePort.set("");
    }

    outIndex.set(0);
    setSelectedProperty(); /* set the selected property for the default value */
}

let finalIndex = 0;
function setSelectedProperty(defaultinput)
{
    const optionElements = input.querySelectorAll("option");

    let finalEle = null;

    optionElements.forEach(function (optionElement, index)
    {
        if (optionElement.value.trim() === valuePort.get())
        {
            finalEle = optionElement;
            finalIndex = index;
        }
        optionElement.removeAttribute("selected");
    });

    if (defaultinput)
    {
        const defaultItem = defaultValuePort.get() + "".trim();

        optionElements.forEach(function (optionElement, index)
        {
            if (optionElement.value.trim() === defaultItem)
            {
                finalEle = optionElement;
                finalIndex = index;
            }

            optionElement.removeAttribute("selected");
        });
    }

    if (finalEle) finalEle.setAttribute("selected", "");
    outIndex.set(finalIndex);
}

function onInput(ev)
{
    valuePort.set(ev.target.value);
    outIndex.set(options.indexOf(ev.target.value));
    setSelectedProperty();
}

function onDefaultValueChanged()
{
    const defaultValue = defaultValuePort.get();
    valuePort.set(defaultValue);
    input.value = defaultValue;
    setSelectedProperty();
}

function onLabelTextChanged()
{
    const lblText = labelPort.get();
    label.textContent = lblText;
    if (CABLES.UI) op.setUiAttrib({ "extendTitle": lblText });
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
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(ele)
{
    if (ele)
    {
        ele.style.display = "block";
    }
    setSelectedProperty();
}

function hideElement(ele)
{
    if (ele)
    {
        ele.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(ele)
{
    if (ele && ele.parentNode && ele.parentNode.removeChild)
    {
        ele.parentNode.removeChild(ele);
    }
}

function setDefault()
{
    defaultValuePort.set(input.value);
    op.refreshParams();
}
