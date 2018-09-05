
var text=op.addOutPort(new Port(op,"text",OP_PORT_TYPE_VALUE));
var visible=op.addInPort(new Port(op,"visible",OP_PORT_TYPE_VALUE,{display:'bool'}));
var inFocus=op.addInPort(new Port(op,"focus",OP_PORT_TYPE_FUNCTION,{display:'button'}));
var inBlur=op.addInPort(new Port(op,"blur",OP_PORT_TYPE_FUNCTION,{display:'button'}));
var cursorPos=op.addOutPort(new Port(op,"cursorPos",OP_PORT_TYPE_VALUE));
var focussed=op.addOutPort(new Port(op,"focussed",OP_PORT_TYPE_VALUE));
var escapeButton=op.addOutPort(new Port(op,"escape pressed",OP_PORT_TYPE_FUNCTION));
var outEle=op.outObject("Element");

visible.set(true);

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

visible.onValueChanged=function()
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
    text.set(element.value);
    cursorPos.set(element.selectionStart);
}
