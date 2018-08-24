
var inId=op.inValueString("Id");
var inClass=op.inValueString("Class");
var inText=op.inValueString("Text","Hello Div");
var inStyle=op.inValueEditor("Style","position:absolute;z-index:9999;","css");

var inInteractive=op.inValueBool("Interactive",false);
var inVisible=op.inValueBool("Visible",true);

var outElement=op.outObject("DOM Element");
var outHover=op.outValue("Hover");
var outClicked=op.outFunction("Clicked");

var listenerElement=null;

var div = document.createElement('div');
var canvas = op.patch.cgl.canvas.parentElement;
// var canvas = op.patch.cgl.canvas;
canvas.appendChild(div);
outElement.set(div);

inClass.onChange=updateClass;
inText.onChange=updateText;
inStyle.onChange=updateStyle;
inInteractive.onChange=updateInteractive;
inVisible.onChange=updateVisibility;

updateText();
updateStyle();

function updateVisibility()
{
    if(!inVisible.get()) 
    {
        div.style.visibility='hidden';
        div.style.display='none';
    }
    else
    {
        div.style.visibility='visible';
        div.style.display='block';
    }
}

function updateText()
{
    div.innerHTML=inText.get();
}

op.onDelete=removeElement;

function removeElement()
{
    div.parentNode.removeChild(div);
}

function updateStyle()
{
    div.setAttribute("style",inStyle.get());
}

function updateClass()
{
    div.setAttribute("class",inClass.get());
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
    if(inInteractive.get()) addListeners();
}

inId.onChange=function()
{
    div.id=inId.get();
};

function removeListeners()
{
    if(listenerElement)
    {
        listenerElement.removeEventListener('click', onMouseClick);
        listenerElement.removeEventListener('mouseleave', onMouseLeave);
        listenerElement.removeEventListener('mouseenter', onMouseEnter);
        listenerElement=null;
    }
}

function addListeners()
{
    if(listenerElement)removeListeners();
    
    listenerElement=div;

    if(listenerElement)
    {
        listenerElement.addEventListener('click', onMouseClick);
        listenerElement.addEventListener('mouseleave', onMouseLeave);
        listenerElement.addEventListener('mouseenter', onMouseEnter);
    }
}