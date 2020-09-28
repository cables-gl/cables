const
    triggerAnim = op.inTriggerButton("Trigger animation"),
    animDuration = op.inFloat("Duration", 1.5),
    percentOrPixel = op.inSwitch("mode", ["%", "px"], "%"),
    divSide = op.inSwitch("Side", ["bottom", "top"], "bottom"),
    startPosition = op.inFloat("Starting position", 0),
    endPosition = op.inFloat("Ending position", 5),
    inText = op.inString("Text", "Pop-up"),
    inId = op.inString("Id", "popup"),
    inClass = op.inString("Class"),
    inStyle = op.inValueEditor("Style", attachments.defaultstyle_txt, "none"),
    inVisible = op.inValueBool("Visible", true),
    inBreaks = op.inValueBool("Convert Line Breaks", false),
    outElement = op.outObject("DOM Element");

op.setPortGroup("Animation", [animDuration]);
op.setPortGroup("Positioning", [percentOrPixel, divSide, startPosition, endPosition]);
op.setPortGroup("HTML CSS", [inText, inId, inClass, inStyle, inVisible, inBreaks]);

// inStyle.setUiAttribs({editorSyntax:'css'});
const listenerElement = null;
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

inId.onChange = function ()
{
    div.id = inId.get();
};


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
    div.style.display = "block";
    if (divSide.get() == "bottom")
    {
        document.getElementById(inId.get()).animate(
            {
                "easing": ["cubic-bezier(0.0, 0.0, 0.2, 1.0)", "linear", "linear", "cubic-bezier(0.0, 0.0, 0.2, 1.0)"],
                "opacity": [0, 1, 1, 0],
                "bottom": [start, end, end, start],
                "offset": [0, 0.25, 0.9, 0.975]
            },
            animDuration.get() * 1000);
    }
    else
    {
        document.getElementById(inId.get()).animate(
            {
                "easing": ["cubic-bezier(0.0, 0.0, 0.2, 1.0)", "linear", "linear", "cubic-bezier(0.42, 0.0, 0.58, 1.0)"],
                "opacity": [0, 1, 1, 0],
                "top": [start, end, end, start],
                "offset": [0, 0.25, 0.9, 0.975]
            },
            animDuration.get() * 1000);
    }
    // div.style.display = "none";
}
