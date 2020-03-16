const
    inEle=op.inObject("Content Element"),
    inShow=op.inTriggerButton("Show"),
    inClose=op.inTriggerButton("Close"),
    closeButton=op.inBool("Show Closebutton",true),
    inOpacity=op.inFloatSlider("Opacity",0.5),
    outVisible=op.outBool("Visible"),
    outElement=op.outObject("Element");

const eleContainer = document.createElement('div');
const eleClose = document.createElement('div');

eleClose.innerHTML="&times;";
eleClose.style.color="white";
eleClose.style.position="fixed";
eleClose.style.top=
eleClose.style.right="25px";
eleClose.style["line-height"]="25px";
eleClose.style["z-index"]="9999";
eleClose.style.cursor="pointer";
eleClose.style['font-size']="50px";
eleClose.addEventListener("click",hide);
eleContainer.addEventListener("click",hide);
eleContainer.appendChild(eleClose);

inOpacity.onChange=updateBgColor;
eleContainer.style.display="none";
inShow.onTriggered=show;
inClose.onTriggered=hide;

closeButton.onChange=updateCloseButton;

function updateCloseButton()
{
    if(!eleClose)return;
    if(closeButton.get()) eleClose.style.display="block";
    else eleClose.style.display="none";
}

inEle.onChange=function()
{
    var ele=inEle.get();
    if(ele && eleContainer) eleContainer.appendChild(ele);
};

function hide()
{
    outVisible.set(false);
    eleContainer.style.display="none";
}

function updateBgColor()
{
    eleContainer.style['background-color']='rgba(0,0,0,'+inOpacity.get()+')';
}

function show()
{
    outVisible.set(true);
    updateCloseButton();
    eleContainer.style.display="block";

    eleContainer.dataset.op=op.id;
    var parent = op.patch.cgl.canvas.parentElement;

    eleContainer.style="overflow:auto;width:100%;height:100%;position:absolute;z-index:9999";
    updateBgColor();

    parent.appendChild(eleContainer);
    outElement.set(eleContainer);
}
