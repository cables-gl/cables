const
    triggerAnim = op.inTriggerButton("Trigger animation"),
    animDuration = op.inFloat("Animation duration", 1.5),
    divSide = op.inSwitch("Side", ["bottom", "top"], "bottom"),
    percentOrPixel = op.inSwitch("mode", ["%", "px"], "%"),
    startPosition = op.inFloat("Start point", 0),
    endPosition = op.inFloat("End point", 5),
    inText = op.inString("Text", "Pop-up"),
    inId = op.inString("Id", "popup"),
    inClass = op.inString("Class"),
    inStyle = op.inValueEditor("Style", attachments.defaultstyle_txt, "none"),
    inInteractive = op.inValueBool("Interactive", false),
    inVisible = op.inValueBool("Visible", true),
    inBreaks = op.inValueBool("Convert Line Breaks", false),
    outElement = op.outObject("DOM Element"),
    outHover = op.outValue("Hover"),
    outClicked = op.outTrigger("Clicked");

// inStyle.setUiAttribs({editorSyntax:'css'});
let listenerElement = null;
let oldStr = null;

let prevDisplay = "block";

const div = document.createElement("div");
div.dataset.op = op.id;
div.id = inId.get();

const canvas = op.patch.cgl.canvas.parentElement;

canvas.appendChild(div);
outElement.set(div);

inClass.onChange = updateClass;
inBreaks.onChange = inText.onChange = updateText;
inStyle.onChange = updateStyle;
inInteractive.onChange = updateInteractive;
inVisible.onChange = updateVisibility;

triggerAnim.onTriggered = popUpAnim;

updateText();
updateStyle();
warning();

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
    warning();
}

function updateClass()
{
    div.setAttribute("class", inClass.get());
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

function onMouseClick()
{
    outClicked.trigger();
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

    if (listenerElement)
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

function popUpAnim()
{
    const mode = percentOrPixel.get();
    const start = startPosition.get() + mode;
    const end = endPosition.get() + mode;

    if (!inId.get()) return;
    if (divSide.get() == "bottom")
    {
        document.getElementById(inId.get()).animate(
            {
                "opacity": [0, 1, 1, 0],
                "bottom": [start, end, end, start]
            },
            animDuration.get() * 1000);
    }
    else
    {
        document.getElementById(inId.get()).animate(
            {
                "opacity": [0, 1, 1, 0],
                "top": [start, end, end, start]
            },
            animDuration.get() * 1000);
    }
}
