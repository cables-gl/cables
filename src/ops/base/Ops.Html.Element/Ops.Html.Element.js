const
    inText = op.inString("Text", "Hello Div"),
    inPos = op.inSwitch("Position", ["Absolute", "Static", "Relative", "Fixed"], "Absolute"),
    inInteractive = op.inValueBool("Interactive", false),

    inSetSize = op.inValueBool("Set Size", true),
    inWidth = op.inFloat("Width", 100),
    inHeight = op.inFloat("Height", 100),
    inOverflow = op.inSwitch("Overflow", ["Visible", "Hidden", "Scroll", "Auto"], "Hidden"),

    inStyle = op.inStringEditor("Inline Style", "", "inline-css"),
    inClass = op.inString("CSS Class"),
    inBlacklist = op.inString("Disable CSS Props"),

    inDisplay = op.inDropDown("Display", ["None", "Block", "Inline", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "flow-root"], "Block"),
    inOpacity = op.inFloatSlider("Opacity", 1),
    inPropagation = op.inValueBool("Propagate Click-Events", true),

    outElement = op.outObject("DOM Element", null, "element"),
    outHover = op.outBoolNum("Hovering"),
    outClicked = op.outTrigger("Clicked");

op.setPortGroup("Area", [inWidth, inHeight, inSetSize, inOverflow]);
op.setPortGroup("CSS", [inClass, inStyle, inBlacklist]);

let listenerElement = null;
let oldStr = null;
let prevDisplay = "block";
let div = null;

const canvas = op.patch.cgl.canvas.parentElement;

createElement();

inClass.onChange = updateClass;
inText.onChange = updateText;

inDisplay.onChange =
    inOpacity.onChange =
    inPos.onChange =
    inWidth.onChange =
    inHeight.onChange =
    inOverflow.onChange =
    inSetSize.onChange =
    inHeight.onChange =
    inStyle.onChange = updateStyle;

inInteractive.onChange = updateInteractive;

updateText();
updateStyle();
warning();
updateInteractive();

let oldClassesStr = "";
op.onDelete = removeElement;

outElement.onLinkChanged = updateStyle;

inInteractive.onLinkChanged =
outClicked.onLinkChanged = () =>
{
    op.setUiError("interactiveProblem", null);
    if (outClicked.isLinked() && !inInteractive.get() && !inInteractive.isLinked())
        op.setUiError("interactiveProblem", "Interactive should be activated when linking clicked port");
};

function createElement()
{
    div = op.patch.getDocument().createElement("div");
    div.dataset.op = op.id;
    div.classList.add("cablesEle");

    canvas.appendChild(div);
    outElement.set(div);
}

function removeElement()
{
    if (div) removeClasses();
    if (div && div.parentNode) div.parentNode.removeChild(div);
    oldStr = null;
    div = null;
}

function updateText()
{
    let str = inText.get();

    if (oldStr === str) return;
    oldStr = str;

    if (div.innerHTML != str) div.innerHTML = str;
    outElement.set(null);
    outElement.set(div);
}

function updateStyle()
{
    if (!div) return;

    div.setAttribute("style", inStyle.get());

    div.style.position = inPos.get().toLowerCase();

    div.style.overflow = inOverflow.get().toLowerCase();
    div.style.display = inDisplay.get();
    div.style.opacity = inOpacity.get();

    if (inSetSize.get())
    {
        div.style.width = inWidth.get() + "px";
        div.style.height = inHeight.get() + "px";
    }
    else
    {
        div.style.width = "";
        div.style.height = "";
    }

    outElement.setRef(div);

    if (!div.parentElement) canvas.appendChild(div);

    warning();
}

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

function onMouseClick(e)
{
    if (!inPropagation.get()) e.stopPropagation();
    outClicked.trigger();
}

function updateInteractive()
{
    op.setUiError("interactiveProblem", null);

    removeListeners();
    if (inInteractive.get()) addListeners();
}

function removeListeners()
{
    if (listenerElement)
    {
        listenerElement.removeEventListener("pointerdown", onMouseClick);
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
        listenerElement.addEventListener("pointerdown", onMouseClick);
        listenerElement.addEventListener("pointerleave", onMouseLeave);
        listenerElement.addEventListener("pointerenter", onMouseEnter);
    }
}

op.addEventListener("onEnabledChange", (enabled) =>
{
    removeElement();
    if (!enabled) return;

    createElement();
    updateStyle();
    updateClass();
    updateText();
    updateInteractive();
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
