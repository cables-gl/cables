const
    inText=op.inString("Text","Hello Div"),
    inId=op.inString("Id"),
    inClass=op.inString("Class"),
    inStyle=op.inValueEditor("Style","position:absolute;z-index:9999;","css"),
    inInteractive=op.inValueBool("Interactive",false),
    inVisible=op.inValueBool("Visible",true),
    inBreaks=op.inValueBool("Convert Line Breaks",false),
    outElement=op.outObject("DOM Element"),
    outHover=op.outValue("Hover"),
    outClicked=op.outTrigger("Clicked");

var listenerElement=null;

var div = document.createElement('div');
div.dataset.op=op.id;
var canvas = op.patch.cgl.canvas.parentElement;

canvas.appendChild(div);
outElement.set(div);

inClass.onChange=updateClass;
inBreaks.onChange=inText.onChange=updateText;
inStyle.onChange=updateStyle;
inInteractive.onChange=updateInteractive;
inVisible.onChange=updateVisibility;

updateText();
updateStyle();

op.onDelete=removeElement;

var prevDisplay='block';

function setCSSVisible(visible)
{
    if(!visible)
    {
        div.style.visibility='hidden';
        prevDisplay=div.style.display||'block';
        div.style.display='none';
    }
    else
    {
        // prevDisplay=div.style.display||'block';
        if(prevDisplay=="none") prevDisplay="block";
        div.style.visibility='visible';
        div.style.display=prevDisplay;
    }
}

function updateVisibility()
{
    setCSSVisible(inVisible.get());
}

var oldStr=null;

function updateText()
{
    var str=inText.get();
    // console.log(oldStr,str);

    if(oldStr===str) return;
    oldStr=str;

    if(inBreaks.get()) str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');

    div.innerHTML=str;
    outElement.set(null);
    outElement.set(div);
}

function removeElement()
{
    div.parentNode.removeChild(div);
}

function updateStyle()
{
    div.setAttribute("style",inStyle.get());
    updateVisibility();
    outElement.set(null);
    outElement.set(div);
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

op.addEventListener("onEnabledChange",function(enabled)
{
    setCSSVisible( div.style.visibility!='visible' );
});

