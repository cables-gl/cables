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
var mouseDownTime=0;

function onMouseDown(e)
{
    mouseDownTime=CABLES.now();
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
}

function onMouseUp(e)
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
}

function onClickRight(e)
{
    mouseClickRight.trigger();
    e.preventDefault();
}

function onDoubleClick(e)
{
    mouseDoubleClick.trigger();
}

function onmouseclick(e)
{
    if(CABLES.now()-mouseDownTime<200)
        mouseClickLeft.trigger();
}

function ontouchstart(event)
{
    if(event.touches && event.touches.length>0)
    {
        event.touches[0].which=1;
        onMouseDown(event.touches[0]);
    }
}

function ontouchend(event)
{
    onMouseUp({which:1});
}

function removeListeners()
{
    if(!listenerElement) return;
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

op.onLoaded=addListeners;

active.onChange=updateListeners;

function updateListeners()
{
    removeListeners();
    if(active.get()) addListeners();
}





