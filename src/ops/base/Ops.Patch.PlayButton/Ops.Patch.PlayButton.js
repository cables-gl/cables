
const
    inExec=op.inTrigger("Trigger"),
    outNext=op.outTrigger("Next"),
    outClicked=op.outValueBool("Clicked");

var wasClicked=false;
const ele=document.createElement("div");
const elePlay=document.createElement("div");
const canvas = op.patch.cgl.canvas.parentElement;

ele.style.width="100px";
ele.style.height="100px";
ele.style.left="50%";
ele.style.top="50%";
ele.style['border-radius']="50px";
ele.style['margin-left']="-50px";
ele.style['margin-top']="-50px";
ele.style.position="absolute";
ele.style.cursor="pointer";
ele.style['z-index']=999999;
ele.style['background-color']="rgba(55,55,55,0.7)";

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
ele.addEventListener('click', clicked);
ele.addEventListener('touchStart', clicked);
op.onDelete=removeElements;

inExec.onTriggered=function()
{
    if(wasClicked) outNext.trigger();
};

function clicked()
{
    removeElements();
    wasClicked=true;
    outClicked.set(wasClicked);
}

function removeElements()
{
    if(elePlay) elePlay.remove();
    if(ele) ele.remove();
}
