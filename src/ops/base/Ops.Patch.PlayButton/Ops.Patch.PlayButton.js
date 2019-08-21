const
    inExec=op.inTrigger("Trigger"),
    inIfSuspended=op.inValueBool("Only if Audio Suspended"),
    inReset=op.inTriggerButton("Reset"),
    outNext=op.outTrigger("Next"),
    outState=op.outString("Audiocontext State"),
    outClicked=op.outValueBool("Clicked");

op.toWorkPortsNeedToBeLinked(inExec);

const canvas = op.patch.cgl.canvas.parentElement;
var wasClicked=false;
var ele=null;
var elePlay=null;
createElements();

function createElements()
{
    if(elePlay) elePlay.remove();
    if(ele) ele.remove();

    ele=document.createElement("div");
    elePlay=document.createElement("div");


    ele.style.width="100px";
    ele.style.height="100px";
    ele.style.left="50%";
    ele.style.top="25%";
    ele.style['border-radius']="50px";
    ele.style['margin-left']="-50px";
    ele.style['margin-top']="-50px";
    ele.style.position="absolute";
    ele.style.cursor="pointer";
    ele.style.opacity=0.7;
    ele.style['z-index']=999999;
    ele.style['background-color']="rgba(55,55,55)";

    elePlay.style["border-style"]="solid";
    elePlay.style["border-color"]="transparent transparent transparent #ccc";
    elePlay.style["box-sizing"]="border-box";
    elePlay.style.width="50px";
    elePlay.style.height="50px";
    elePlay.style['margin-top']="15px";
    elePlay.style['margin-left']="33px";
    elePlay.style["border-width"]="35px 0px 35px 50px";
    elePlay.style['pointer-events']="none";

    canvas.appendChild(ele);
    ele.appendChild(elePlay);
    ele.addEventListener('mouseenter', hover);
    ele.addEventListener('mouseleave', hoverOut);
    ele.addEventListener('click', clicked);
    ele.addEventListener('touchStart', clicked);
    op.onDelete=removeElements;
}

inReset.onTriggered=function()
{
    createElements();
    wasClicked=false;
    outClicked.set(wasClicked);

};

inExec.onTriggered=function()
{
    if(window.audioContext)
    {
        outState.set(window.audioContext.state);
    }

    if(inIfSuspended.get() && window.audioContext.state=='running') clicked();
    if(wasClicked) outNext.trigger();

};

function clicked()
{
    removeElements();
    if(window.audioContext && window.audioContext.state=='suspended')window.audioContext.resume();
    wasClicked=true;
    outClicked.set(wasClicked);
}

function removeElements()
{
    if(elePlay) elePlay.remove();
    if(ele) ele.remove();
}

function hoverOut()
{
    if(ele) ele.style.opacity=0.7;
}

function hover()
{
    if(ele) ele.style.opacity=1.0;
}