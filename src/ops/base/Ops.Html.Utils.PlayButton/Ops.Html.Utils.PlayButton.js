const
    inExec = op.inTrigger("Trigger"),
    inIfSuspended = op.inValueBool("Only if Audio Suspended"),
    inReset = op.inTriggerButton("Reset"),
    inStyleOuter = op.inStringEditor("Style Outer", attachments.outer_css),
    inStyleInner = op.inStringEditor("Style Inner", attachments.inner_css),
    inActive = op.inBool("Active", true),
    outNext = op.outTrigger("Next"),
    notClickedNext = op.outTrigger("Not Clicked"),
    outState = op.outString("Audiocontext State", "unknown"),
    outEle = op.outObject("Element"),
    outClicked = op.outBoolNum("Clicked", false),
    outClickedTrigger = op.outTrigger("Clicked Trigger");

op.toWorkPortsNeedToBeLinked(inExec);
let audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

const canvas = op.patch.cgl.canvas.parentElement;
let wasClicked = false;
let ele = null;
let elePlay = null;
createElements();

inStyleOuter.onChange =
    inStyleInner.onChange = createElements;

audioCtx.addEventListener("statechange", updateState);
updateState();

inActive.onChange = () =>
{
    if (!inActive.get())ele.style.display = "none";
    else ele.style.display = "block";
};

function createElements()
{
    updateState();
    if (elePlay) elePlay.remove();
    if (ele) ele.remove();

    ele = document.createElement("div");
    ele.style = inStyleOuter.get();
    outEle.set(ele);

    canvas.appendChild(ele);

    elePlay = document.createElement("div");
    elePlay.style = inStyleInner.get();

    ele.appendChild(elePlay);
    ele.classList.add("playButton");

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

function updateState()
{
    outState.set(audioCtx.state);
    if (inIfSuspended.get() && audioCtx.state == "running") clicked();
}

inExec.onTriggered = function ()
{
    if (wasClicked) outNext.trigger();
    else notClickedNext.trigger();
};

function clicked()
{
    removeElements();
    if (audioCtx && audioCtx.state == "suspended")audioCtx.resume();
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
