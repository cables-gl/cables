const
    inText = op.inString("Text", "Hello Div"),
    inId = op.inString("Id"),
    inClass = op.inString("Class"),
    inStyle = op.inValueEditor("Style", "position:absolute;\nz-index:100;", "css"),
    inInteractive = op.inValueBool("Interactive", false),
    inVisible = op.inValueBool("Visible", true),
    inBreaks = op.inValueBool("Convert Line Breaks", false),
    inPropagation = op.inValueBool("Propagate Click-Events", true),
    outElement = op.outObject("DOM Element"),
    outHover = op.outValue("Hover"),
    outClicked = op.outTrigger("Clicked");

let listenerElement = null;
let oldStr = null;
let prevDisplay = "block";

const div = document.createElement("div");
div.dataset.op = op.id;
const canvas = op.patch.cgl.canvas.parentElement;

canvas.appendChild(div);
outElement.set(div);

inClass.onChange = updateClass;
inBreaks.onChange = inText.onChange = updateText;
inStyle.onChange = updateStyle;
inInteractive.onChange = updateInteractive;
inVisible.onChange = updateVisibility;

updateText();
updateStyle();
warning();
updateInteractive();

op.onDelete = removeElement;

outElement.onLinkChanged = updateStyle;

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
        // prevDisplay=div.style.display||'block';
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

    if (oldStr === str) return;
    oldStr = str;

    if (str && inBreaks.get()) str = str.replace(/(?:\r\n|\r|\n)/g, "<br>");

    if (div.innerHTML != str) div.innerHTML = str;
    outElement.set(null);
    outElement.set(div);
}

function removeElement()
{
    if (div) removeClasses();
    if (div && div.parentNode) div.parentNode.removeChild(div);
}

// inline css inisde div
function updateStyle()
{
    if (inStyle.get() != div.style)
    {
        div.setAttribute("style", inStyle.get());
        updateVisibility();
        outElement.set(null);
        outElement.set(div);
    }

    if (!div.parentElement)
    {
        canvas.appendChild(div);
    }

    warning();
}

let oldClassesStr = "";

function removeClasses()
{
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
        console.log("old", i, oldClasses[i], classes.indexOf(oldClasses[i].trim()));
        if (
            oldClasses[i] &&
            classes.indexOf(oldClasses[i].trim()) == -1)
        // div.classList.contains(oldClasses[i].trim()))
        {
            found = true;
            console.log("remove", oldClasses[i]);
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

function onMouseEnter()
{
    outHover.set(true);
}

function onMouseLeave()
{
    outHover.set(false);
}

function onMouseClick(e)
{
    if (!inPropagation.get())
    {
        e.stopPropagation();
    }
    outClicked.trigger();
}

function updateInteractive()
{
    if (div)
    {
        div.removeEventListener("mouseleave", uiHoverOut);
        div.removeEventListener("mouseenter", uiHover);
    }

    removeListeners();
    if (inInteractive.get()) addListeners();

    if (div)
    {
        div.addEventListener("mouseleave", uiHoverOut);
        div.addEventListener("mouseenter", uiHover);
    }
}

let uiHovering = false;
function uiHoverOut()
{
    if (uiHovering)gui.highlightHtmlElement(null);
}
function uiHover(e)
{
    if (e.ctrlKey && div)
    {
        uiHovering = true;
        gui.highlightHtmlElement(div, op.id);
    }
}

inId.onChange = function ()
{
    div.id = inId.get();
};

function removeListeners()
{
    if (op.patch.isEditorMode() && listenerElement)
    {
        listenerElement.removeEventListener("click", onMouseClick);
        listenerElement.removeEventListener("mouseleave", onMouseLeave);
        listenerElement.removeEventListener("mouseenter", onMouseEnter);
        listenerElement = null;
    }
}

function addListeners()
{
    if (listenerElement)removeListeners();

    listenerElement = div;

    if (op.patch.isEditorMode() && listenerElement)
    {
        listenerElement.addEventListener("click", onMouseClick);
        listenerElement.addEventListener("mouseleave", onMouseLeave);
        listenerElement.addEventListener("mouseenter", onMouseEnter);
    }
}

op.addEventListener("onEnabledChange", function (enabled)
{
    op.log("css changed");
    setCSSVisible(div.style.visibility != "visible");
});

function warning()
{
    if (inClass.get() && inStyle.get())
    {
        op.setUiError("error", "DIV uses external and inline CSS", 1);
    }
    else
    {
        op.setUiError("error", null);
    }
}
