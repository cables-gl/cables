const
    inElType = op.inSwitch("Element", ["Input", "Textarea"], "Input"),
    inType = op.inSwitch("Type", ["Text", "Number", "Password", "Date"], "Text"),
    inText = op.inString("Default Value", ""),
    inPlaceHolder = op.inString("Placeholder", "Type here..."),
    inId = op.inString("Id"),
    inClass = op.inString("Class"),
    inStyle = op.inStringEditor("Style", "color:#ccc;\nbackground-color:#222;\nborder:none;\npadding:4px;\n", "inline-css"),

    inAutoComplete = op.inBool("Autocomplete", false),
    inMaxLength = op.inInt("Max Length", 0),

    inInteractive = op.inValueBool("Interactive", false),
    inVisible = op.inValueBool("Visible", true),

    inFocus = op.inTriggerButton("Focus"),
    inBlur = op.inTriggerButton("Blur"),
    inClear = op.inTriggerButton("Clear"),
    inSelect = op.inTriggerButton("Select"),

    outElement = op.outObject("DOM Element", null, "element"),
    outString = op.outString("Value"),
    outHover = op.outBoolNum("Hover");

let listenerElement = null;
let prevDisplay = "block";
let div = null;

const canvas = op.patch.cgl.canvas.parentElement;

createElement();

inSelect.onTriggered = () =>
{
    div.select();
};

inClear.onTriggered = () =>
{
    div.value = "";
};

inFocus.onTriggered = () =>
{
    div.focus();
};

inBlur.onTriggered = () =>
{
    div.blur();
};

inElType.onChange = () =>
{
    createElement();
    updateStyle();
};

inMaxLength.onChange =
    inType.onChange =
    inAutoComplete.onChange =
    inClass.onChange = updateClass;

inPlaceHolder.onChange = inText.onChange = updateText;

inStyle.onChange = updateStyle;
inInteractive.onChange = updateInteractive;
inVisible.onChange = updateVisibility;

updateText();
updateStyle();
warning();
updateInteractive();

op.onDelete = removeElement;

outElement.onLinkChanged = updateStyle;

function createElement()
{
    removeElement();
    div = document.createElement(inElType.get().toLowerCase());

    div.addEventListener("input", () =>
    {
        outString.set(div.value);
    });

    div.dataset.op = op.id;
    div.classList.add("cablesEle");

    if (inId.get()) div.id = inId.get();

    canvas.appendChild(div);
    outElement.set(div);
}

function removeElement()
{
    if (div) removeClasses();
    if (div && div.parentNode) div.parentNode.removeChild(div);
    div = null;
}

function setCSSVisible(visible)
{
    if (!visible)
    {
        div.style.visibility = "hidden";
        prevDisplay = div.style.display || "block";
        div.style.display = "none";
    }
    else
    {
        if (prevDisplay == "none") prevDisplay = "block";
        div.style.visibility = "visible";
        div.style.display = prevDisplay;
    }
}

function updateVisibility()
{
    setCSSVisible(inVisible.get());
}

function updateText()
{
    let str = inText.get();

    div.setAttribute("placeholder", inPlaceHolder.get());
    div.value = str;

    outString.set(str);

    outElement.setRef(div);
}

function updateStyle()
{
    if (!div) return;

    div.setAttribute("style", inStyle.get());
    updateVisibility();
    outElement.set(null);
    outElement.set(div);

    if (!div.parentElement)
    {
        canvas.appendChild(div);
    }

    warning();
}

let oldClassesStr = "";

function removeClasses()
{
    if (!div) return;

    const classes = (inClass.get() || "").split(" ");
    for (let i = 0; i < classes.length; i++)
    {
        if (classes[i]) div.classList.remove(classes[i]);
    }
    oldClassesStr = "";
}

function updateClass()
{
    div.setAttribute("tabindex", 0);
    div.setAttribute("maxlength", inMaxLength.get() || null);
    div.setAttribute("type", inType.get().toLowerCase());

    if (inAutoComplete.get()) div.setAttribute("autocomplete", "on");
    else div.setAttribute("autocomplete", "off");

    const classes = (inClass.get() || "").split(" ");
    const oldClasses = (oldClassesStr || "").split(" ");

    let found = false;

    for (let i = 0; i < oldClasses.length; i++)
    {
        if (
            oldClasses[i] &&
            classes.indexOf(oldClasses[i].trim()) == -1)
        {
            found = true;
            div.classList.remove(oldClasses[i]);
        }
    }

    for (let i = 0; i < classes.length; i++)
    {
        if (classes[i])
        {
            div.classList.add(classes[i].trim());
        }
    }

    oldClassesStr = inClass.get();
    warning();
}

function onMouseEnter(e)
{
    outHover.set(true);
}

function onMouseLeave(e)
{
    outHover.set(false);
}

function updateInteractive()
{
    removeListeners();
    if (inInteractive.get()) addListeners();
}

inId.onChange = function ()
{
    div.id = inId.get();
};

function removeListeners()
{
    if (listenerElement)
    {
        listenerElement.removeEventListener("pointerleave", onMouseLeave);
        listenerElement.removeEventListener("pointerenter", onMouseEnter);
        listenerElement = null;
    }
}

function addListeners()
{
    if (listenerElement)removeListeners();

    listenerElement = div;

    if (listenerElement)
    {
        listenerElement.addEventListener("pointerleave", onMouseLeave);
        listenerElement.addEventListener("pointerenter", onMouseEnter);
    }
}

op.addEventListener("onEnabledChange", function (enabled)
{
    removeElement();
    if (enabled)
    {
        createElement();
        updateStyle();
        updateClass();
        updateText();
        updateInteractive();
    }
});

function warning()
{
    if (inClass.get() && inStyle.get())
    {
        op.setUiError("error", "Element uses external and inline CSS", 1);
    }
    else
    {
        op.setUiError("error", null);
    }
}
