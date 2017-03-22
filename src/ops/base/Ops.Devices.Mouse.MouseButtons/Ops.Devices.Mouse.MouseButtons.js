op.name="MouseButtons";
var cgl=op.patch.cgl;

var mouseClickRight=op.outFunction("Click Right");
var mouseClickLeft=op.outFunction("Click Left");
var mouseDoubleClick=op.outFunction("Double Click");
var mouseDownLeft=op.outValue("Button pressed Left");
var mouseDownMiddle=op.outValue("Button pressed Middle");


var mouseDownRight=op.outValue("Button pressed Right");

var area=op.addInPort(new Port(op,"Area",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['Canvas','Document']}));

area.set("Canvas");

var listenerElement=null;

area.onValueChanged=addListeners;


var onMouseDown = function(e)
{
    if(e.which==1)mouseDownLeft.set(true);
    if(e.which==2)mouseDownMiddle.set(true);
    if(e.which==3)mouseDownRight.set(true);
};

var onMouseUp = function(e)
{
    if(e.which==1)mouseDownLeft.set(false);
    if(e.which==2)mouseDownMiddle.set(false);
    if(e.which==3)mouseDownRight.set(false);
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

function removeLiseteners()
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
    if(listenerElement)removeLiseteners();
    
    listenerElement=cgl.canvas;
    if(area.get()=='Document') listenerElement=document.body;
    
    listenerElement.addEventListener('click', onmouseclick);
    listenerElement.addEventListener('mousedown', onMouseDown);
    listenerElement.addEventListener('mouseup', onMouseUp);
    listenerElement.addEventListener('contextmenu', onClickRight);
}


op.onDelete=function()
{
    console.log("remove mouse op...");
    removeLiseteners();
};

addListeners();