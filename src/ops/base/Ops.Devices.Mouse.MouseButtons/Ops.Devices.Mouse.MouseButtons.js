op.name="MouseButtons";
var cgl=op.patch.cgl;

var mouseClickLeft=op.outFunction("Click Left");
var mouseClickRight=op.outFunction("Click Right");
var mouseDoubleClick=op.outFunction("Double Click");

var mouseDownLeft=op.outValue("Button pressed Left",false);
var mouseDownMiddle=op.outValue("Button pressed Middle",false);
var mouseDownRight=op.outValue("Button pressed Right",false);

var triggerMouseDownLeft=op.outFunction("Mouse Down Left");
var triggerMouseDownMiddle=op.outFunction("Mouse Down Middle");
var triggerMouseDownRight=op.outFunction("Mouse Down Right");

var triggerMouseUpLeft=op.outFunction("Mouse Up Left");
var triggerMouseUpMiddle=op.outFunction("Mouse Up Middle");
var triggerMouseUpRight=op.outFunction("Mouse Up Right");

var area=op.addInPort(new Port(op,"Area",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['Canvas','Document']}));
var active=op.inValueBool("Active",true);

area.set("Canvas");

var listenerElement=null;

area.onValueChanged=addListeners;


var onMouseDown = function(e)
{
    if(e.which==1)
    {
        mouseDownLeft.set(true);
        triggerMouseDownLeft.trigger();
    }
    if(e.which==2)
    {
        mouseDownMiddle.set(true);
        triggerMouseDownMiddle.trigger();
    }
    if(e.which==3)
    {
        mouseDownRight.set(true);
        triggerMouseDownRight.trigger();
    }
};

var onMouseUp = function(e)
{
    if(e.which==1)
    {
        mouseDownLeft.set(false);
        triggerMouseUpLeft.trigger();
    }
    if(e.which==2)
    {
        mouseDownMiddle.set(false);
        triggerMouseUpMiddle.trigger();
    }
    if(e.which==3)
    {
        mouseDownRight.set(false);
        triggerMouseUpRight.trigger();
    }
};

var onClickRight= function(e)
{
    mouseClickRight.trigger();
    e.preventDefault();
};

function onDoubleClick(e)
{
    mouseDoubleClick.trigger();
}

function onmouseclick(e)
{
    mouseClickLeft.trigger();
}

function removeListeners()
{
    
    listenerElement.removeEventListener('dblclick', onDoubleClick);
    listenerElement.removeEventListener('click', onmouseclick);
    listenerElement.removeEventListener('mousedown', onMouseDown);
    listenerElement.removeEventListener('mouseup', onMouseUp);
    listenerElement.removeEventListener('contextmenu', onClickRight);
    listenerElement=null;
}

function addListeners()
{
    if(listenerElement)removeListeners();
    
    listenerElement=cgl.canvas;
    if(area.get()=='Document') listenerElement=document.body;
    
    listenerElement.addEventListener('dblclick', onDoubleClick);
    listenerElement.addEventListener('click', onmouseclick);
    listenerElement.addEventListener('mousedown', onMouseDown);
    listenerElement.addEventListener('mouseup', onMouseUp);
    listenerElement.addEventListener('contextmenu', onClickRight);
}

active.onChange=function()
{
    if(listenerElement) removeListeners();
    if(active.get()) addListeners();
    
};

op.onDelete=function()
{
    console.log("remove mouse op...");
    removeListeners();
};

addListeners();