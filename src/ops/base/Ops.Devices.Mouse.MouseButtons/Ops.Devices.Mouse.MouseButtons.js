const
    mouseClickLeft=op.outTrigger("Click Left"),
    mouseClickRight=op.outTrigger("Click Right"),
    mouseDoubleClick=op.outTrigger("Double Click"),
    mouseDownLeft=op.outValue("Button pressed Left",false),
    mouseDownMiddle=op.outValue("Button pressed Middle",false),
    mouseDownRight=op.outValue("Button pressed Right",false),
    triggerMouseDownLeft=op.outTrigger("Mouse Down Left"),
    triggerMouseDownMiddle=op.outTrigger("Mouse Down Middle"),
    triggerMouseDownRight=op.outTrigger("Mouse Down Right"),
    triggerMouseUpLeft=op.outTrigger("Mouse Up Left"),
    triggerMouseUpMiddle=op.outTrigger("Mouse Up Middle"),
    triggerMouseUpRight=op.outTrigger("Mouse Up Right"),
    area=op.inValueSelect("Area",['Canvas','Document'],'Canvas'),
    active=op.inValueBool("Active",true);

const cgl=op.patch.cgl;
var listenerElement=null;
area.onChange=addListeners;
op.onDelete=removeListeners;
addListeners();

var onMouseDown = function(e)
{
    if(e.which==1)
    {
        mouseDownLeft.set(true);
        triggerMouseDownLeft.trigger();
    }
    else if(e.which==2)
    {
        mouseDownMiddle.set(true);
        triggerMouseDownMiddle.trigger();
    }
    else if(e.which==3)
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
    else if(e.which==2)
    {
        mouseDownMiddle.set(false);
        triggerMouseUpMiddle.trigger();
    }
    else if(e.which==3)
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

var ontouchstart=function(event)
{
    if(event.touches && event.touches.length>0)
    {
        event.touches[0].which=1;
        onMouseDown(event.touches[0]);
    }
};

var ontouchend=function(event)
{
    onMouseUp({which:1});
};

function removeListeners()
{
    listenerElement.removeEventListener('touchend', ontouchend);
    listenerElement.removeEventListener('touchcancel', ontouchend);
    listenerElement.removeEventListener('touchstart', ontouchstart);
    listenerElement.removeEventListener('dblclick', onDoubleClick);
    listenerElement.removeEventListener('click', onmouseclick);
    listenerElement.removeEventListener('mousedown', onMouseDown);
    listenerElement.removeEventListener('mouseup', onMouseUp);
    listenerElement.removeEventListener('contextmenu', onClickRight);
    listenerElement.removeEventListener('mouseleave', onMouseUp);
    listenerElement=null;
}

function addListeners()
{
    if(listenerElement)removeListeners();

    listenerElement=cgl.canvas;
    if(area.get()=='Document') listenerElement=document.body;

    listenerElement.addEventListener('touchend', ontouchend);
    listenerElement.addEventListener('touchcancel', ontouchend);
    listenerElement.addEventListener('touchstart', ontouchstart);
    listenerElement.addEventListener('dblclick', onDoubleClick);
    listenerElement.addEventListener('click', onmouseclick);
    listenerElement.addEventListener('mousedown', onMouseDown);
    listenerElement.addEventListener('mouseup', onMouseUp);
    listenerElement.addEventListener('contextmenu', onClickRight);
    listenerElement.addEventListener('mouseleave', onMouseUp);
}

active.onChange=function()
{
    if(listenerElement) removeListeners();
    if(active.get()) addListeners();
};


