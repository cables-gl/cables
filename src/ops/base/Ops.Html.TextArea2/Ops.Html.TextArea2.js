var visible=op.inValueBool("visible",true);
var inFocus=op.inTriggerButton("focus");
var inBlur=op.inTriggerButton("blur");

var text=op.outString("text",'');
var cursorPos=op.outValue("cursorPos");
var focussed=op.outValueBool("focussed");
var escapeButton=op.outTrigger("escape pressed");
var outEle=op.outObject("Element");


var element = document.createElement('textarea');
element.id="thetextarea";
element.style.position="absolute";
element.style.top="0px";
element.style.width="300px";
element.style.opacity=0.75;
element.style.height="100px";
element.style.overflow="hidden";
element.style.border="none";
element.style.padding=0;
element.style['z-index']="999999";

outEle.set(element);

var canvas = document.body;
canvas.appendChild(element);

element.addEventListener("input", update);
element.onkeydown=update;
update();

visible.onChange=function()
{
    if(!visible.get())
    {
        element.style.width='0px';
        element.style.height='0px';
    }
    else
    {
        element.style.width='300px';
        element.style.height='100px';
    }
};

element.onfocus=function()
{
    element.focus();
    focussed.set(true);
};

element.onblur=function()
{
    focussed.set(false);
    canvas.focus();
};

element.onkeyup = function(e)
{
    if (e.keyCode == 27)
    {
        focussed.set(false);
        escapeButton.trigger();
    }
};

op.onDelete=function()
{
    element.remove();
};

inFocus.onTriggered=function()
{
    element.focus();
};

inBlur.onTriggered=function()
{
    element.blur();
};

function update()
{
    text.set(element.value||'');
    cursorPos.set(element.selectionStart);
}
