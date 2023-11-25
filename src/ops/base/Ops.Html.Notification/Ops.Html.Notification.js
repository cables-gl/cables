const
    triggerAnim = op.inTriggerButton("Trigger animation"),
    inText = op.inString("Text", "Hello! <br> This is a pop up"),
    inClass = op.inString("Class"),
    inStyle = op.inStringEditor("Style", attachments.defaultstyle_txt, "none"),
    inVisible = op.inValueBool("Active", true),
    inBreaks = op.inValueBool("Convert Line Breaks", false),
    fadeInDuration = op.inFloat("Fade in", 0.5),
    holdDuration = op.inFloat("Hold ", 2.0),
    fadeOutDuration = op.inFloat("Fade out", 0.8),
    percentOrPixel = op.inSwitch("mode", ["%", "px"], "%"),
    divSide = op.inSwitch("Side", ["bottom", "top"], "bottom"),
    startPosition = op.inFloat("Starting position", 0),
    endPosition = op.inFloat("Ending position", 5),
    finishedTrigger = op.outTrigger("Finished trigger"),
    finished = op.outBool("Finished", false),
    outElement = op.outObject("DOM Element");

op.setPortGroup("Animation", [fadeInDuration, holdDuration, fadeOutDuration]);
op.setPortGroup("HTML CSS", [inText, inClass, inStyle, inVisible, inBreaks]);
op.setPortGroup("Positioning", [percentOrPixel, divSide, startPosition, endPosition]);

const divid = "notification_" + CABLES.uuid();

// inStyle.setUiAttribs({editorSyntax:'css'});
const listenerElement = null;
let oldStr = null;

let prevDisplay = "block";

const div = document.createElement("div");
div.dataset.op = op.id;
div.id = divid;

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

let animInProgress = false;

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
        div.style.display = "none";
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

op.addEventListener("onEnabledChange", function (enabled)
{
    op.log("css changed");
    setCSSVisible(div.style.visibility != "visible");
});

function warning()
{
    if (inClass.get() && inStyle.get()) op.setUiError("error", "DIV uses external and inline CSS", 1);
    else op.setUiError("error", null);
}

function popUpAnim()
{
    if (!inVisible.get()) return;

    const mode = percentOrPixel.get();
    const start = startPosition.get() + mode;
    const end = endPosition.get() + mode;

    const targetDiv = document.getElementById(divid);
    div.style.display = "block";

    const animData = {};
    // this function cascades into each stage when started
    startAnim(mode, start, end, animData);
}

function startAnim(mode, start, end, animData)
{
    // stop the glitches from it being triggered multiple times
    if (animInProgress) return;

    finished.set(false);
    animInProgress = true;

    animData.easing = ["cubic-bezier(0.0, 0.0, 0.2, 1.0)", "linear"];
    animData.opacity = [0, 1];

    if (divSide.get() == "bottom") animData.bottom = [start, end];
    else animData.top = [start, end];

    document.getElementById(divid).animate(
        animData, fadeInDuration.get() * 1000).onfinish = function ()
    {
        holdAnim(mode, start, end, animData);
    };
}

function holdAnim(mode, start, end, animData)
{
    animData.easing = ["linear", "linear"];
    animData.opacity = [1, 1];

    if (divSide.get() == "bottom") animData.bottom = [end, end];
    else animData.top = [end, end];

    document.getElementById(divid).animate(animData, holdDuration.get() * 1000).onfinish =
        function ()
        {
            endAnim(mode, start, end, animData);
        };
}

function endAnim(mode, start, end, animData)
{
    animData.easing = ["cubic-bezier(0.0, 0.0, 0.2, 1.0)", "linear"];
    animData.opacity = [1, 0];

    if (divSide.get() == "bottom") animData.bottom = [end, start];
    else animData.top = [end, start];

    document.getElementById(divid).animate(
        animData, fadeOutDuration.get() * 1000).onfinish = function ()
    {
        div.style.display = "none";
        animInProgress = false;
        finishedTrigger.trigger();
        finished.set(true);
    };
}
