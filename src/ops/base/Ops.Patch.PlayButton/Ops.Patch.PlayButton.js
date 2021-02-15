const
    inExec = op.inTrigger("Trigger"),
    inIfSuspended = op.inValueBool("Only if Audio Suspended"),
    inReset = op.inTriggerButton("Reset"),
    inStyleOuter = op.inStringEditor("Style Outer", attachments.outer_css),
    inStyleInner = op.inStringEditor("Style Inner", attachments.inner_css),
    inActive = op.inBool("Active", true),
    outNext = op.outTrigger("Next"),
    notClickedNext = op.outTrigger("Not Clicked"),
    outState = op.outString("Audiocontext State"),
    outEle = op.outObject("Element"),
    outClicked = op.outValueBool("Clicked", false),
    outClickedTrigger = op.outTrigger("Clicked Trigger");

op.toWorkPortsNeedToBeLinked(inExec);

const canvas = op.patch.cgl.canvas.parentElement;
let wasClicked = false;
let ele = null;
let elePlay = null;
createElements();

inStyleOuter.onChange =
    inStyleInner.onChange = createElements;

inActive.onChange = () =>
{
    if (!inActive.get())ele.style.display = "none";
    else ele.style.display = "block";
};

function createElements()
{
    if (elePlay) elePlay.remove();
    if (ele) ele.remove();

    ele = document.createElement("div");
    ele.style = inStyleOuter.get();
    outEle.set(ele);
    canvas.appendChild(ele);

    elePlay = document.createElement("div");
    elePlay.style = inStyleInner.get();

    ele.appendChild(elePlay);

    ele.addEventListener("mouseenter", hover);
    ele.addEventListener("mouseleave", hoverOut);
    ele.addEventListener("click", clicked);
    ele.addEventListener("touchStart", clicked);
    op.onDelete = removeElements;
}

inReset.onTriggered = function ()
{
    createElements();
    wasClicked = false;
    outClicked.set(wasClicked);
};

inExec.onTriggered = function ()
{
    if (window.audioContext)
    {
        outState.set(window.audioContext.state);
    }

    if (inIfSuspended.get() && window.audioContext.state == "running") clicked();
    if (wasClicked) outNext.trigger();
    else notClickedNext.trigger();
};

function clicked()
{
    removeElements();
    if (window.audioContext && window.audioContext.state == "suspended")window.audioContext.resume();
    wasClicked = true;
    outClicked.set(wasClicked);
    outClickedTrigger.trigger();
}

function removeElements()
{
    if (elePlay) elePlay.remove();
    if (ele) ele.remove();
}

function hoverOut()
{
    if (ele) ele.style.opacity = 0.7;
}

function hover()
{
    if (ele) ele.style.opacity = 1.0;
}
