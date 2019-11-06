const
    active=op.inValueBool("Active",true),
    speed=op.inValue("Speed",0.01),
    inputType=op.inSwitch("Input Type",['All','Mouse','Touch'],"All"),
    area=op.inSwitch("Area",['Canvas','Document'],'Canvas'),
    outDeltaX=op.outValue("Delta X"),
    outDeltaY=op.outValue("Delta Y"),
    outDragging=op.outValue("Is Dragging");

var listenerElement=null;
var absoluteX=0;
var absoluteY=0;
var pressed=false;
var lastX=0;
var lastY=0;
var firstMove=true;

area.onChange=updateArea;

updateArea();


function onMouseMove(e)
{
    if(e.touches) e=e.touches[0];

    if(pressed && e)
    {
        if(!firstMove)
        {
            outDragging.set(true);
            var deltaX=(e.clientX-lastX)*speed.get();
            var deltaY=(e.clientY-lastY)*speed.get();

            outDeltaX.set(0);
            outDeltaY.set(0);
            outDeltaX.set(deltaX);
            outDeltaY.set(deltaY);
        }

        firstMove=false;

        lastX=e.clientX;
        lastY=e.clientY;
    }
}


function onMouseDown(e)
{
    pressed=true;
}

function onMouseUp(e)
{
    pressed=false;
    outDragging.set(false);
    lastX=0;
    lastY=0;
    firstMove=true;
}


function updateArea()
{
    removeListener();

    if(area.get()=='Document') listenerElement = document;
    else listenerElement = op.patch.cgl.canvas;

    if(active.get())addListener();
}

function addListener()
{
    if(!listenerElement)updateArea();

    if(inputType.get()=="All" || inputType.get()=="Mouse")
    {
        listenerElement.addEventListener('mousemove', onMouseMove);
        listenerElement.addEventListener('mousedown', onMouseDown);
        listenerElement.addEventListener('mouseup', onMouseUp);
        listenerElement.addEventListener('mouseenter', onMouseUp);
        listenerElement.addEventListener('mouseleave', onMouseUp);
    }

    if(inputType.get()=="All" || inputType.get()=="Touch")
    {
        listenerElement.addEventListener("touchmove", onMouseMove);
        listenerElement.addEventListener("touchend", onMouseUp);
        listenerElement.addEventListener('touchstart', onMouseDown);
    }
}

function removeListener()
{
    if(!listenerElement)return;
    listenerElement.removeEventListener('mousemove', onMouseMove);
    listenerElement.removeEventListener('mousedown', onMouseDown);
    listenerElement.removeEventListener('mouseup', onMouseUp);
    listenerElement.removeEventListener('mouseenter', onMouseUp);
    listenerElement.removeEventListener('mouseleave', onMouseUp);

    listenerElement.removeEventListener("touchmove", onMouseMove);
    listenerElement.removeEventListener("touchend", onMouseUp);
    listenerElement.removeEventListener('touchstart', onMouseDown);
}

active.onChange=function()
{
    if(active.get())addListener();
    else removeListener();
};


op.onDelete=function()
{
    removeListener();
};

