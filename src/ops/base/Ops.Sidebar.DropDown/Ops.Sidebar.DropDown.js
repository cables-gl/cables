// inputs
const parentPort = op.inObject("Link");
const labelPort = op.inValueString("Text", "Value");
const valuesPort = op.inArray("Values");
const defaultValuePort = op.inValueString("Default", "");
const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);


// outputs
const siblingsPort = op.outObject("Children");
const valuePort = op.outValue("Result", defaultValuePort.get());
const outIndex = op.outNumber("Index");

// vars
let el = document.createElement("div");
el.classList.add("sidebar__item");
el.classList.add("sidebar__select");
let label = document.createElement("div");
label.classList.add("sidebar__item-label");
let labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
let input = document.createElement("select");
input.classList.add("sidebar__select-select");
el.appendChild(input);
input.addEventListener("input", onInput);

let greyOut = document.createElement("div");
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

function onValuesPortChange()
{
    // remove all children
    while (input.lastChild)
    {
        input.removeChild(input.lastChild);
    }
    options = valuesPort.get();
    let defaultValue = defaultValuePort.get();
    if (options)
    {
        options.forEach(function (option)
        {
            const optionEl = document.createElement("option");
            optionEl.setAttribute("value", option);
            if (option === defaultValue)
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
    setSelectedProperty(); /* set the selected property for the default value */
}

function setSelectedProperty()
{
    const defaultItem = defaultValuePort.get();
    const optionElements = input.querySelectorAll("option");
    optionElements.forEach(function (optionElement)
    {
        if (optionElement.value === defaultItem)
        {
            optionElement.setAttribute("selected", "");
        }
        else
        {
            optionElement.removeAttribute("selected");
        }
    });
}

function onInput(ev)
{
    valuePort.set(ev.target.value);
    outIndex.set(options.indexOf(ev.target.value));
}

function onDefaultValueChanged()
{
    let defaultValue = defaultValuePort.get();
    valuePort.set(defaultValue);
    // input.value = defaultValue;
    setSelectedProperty();
}

function onLabelTextChanged()
{
    let labelText = labelPort.get();
    label.textContent = labelText;
    if (CABLES.UI) op.setUiAttrib({ "extendTitle": labelText });
}

function onParentChanged()
{
    let parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(null);
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
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
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
