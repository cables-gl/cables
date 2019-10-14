const
    active=op.inValueBool("Active",true),
    speed=op.inValue("Speed",0.01),
    inputType=op.inSwitch("Input Type",['All','Mouse','Touch'],"All"),
    outDeltaX=op.outValue("Delta X"),
    outDeltaY=op.outValue("Delta Y"),
    outDragging=op.outValue("Is Dragging");

const canvas=op.patch.cgl.canvas;
var absoluteX=0;
var absoluteY=0;
var pressed=false;
var lastX=0;
var lastY=0;
var firstMove=true;

bind();


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



function bind()
{
    if(inputType.get()=="All" || inputType.get()=="Mouse")
    {
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseenter', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);
    }

    if(inputType.get()=="All" || inputType.get()=="Touch")
    {
        canvas.addEventListener("touchmove", onMouseMove);
        canvas.addEventListener("touchend", onMouseUp);
        canvas.addEventListener('touchstart', onMouseDown);
    }
}

function unbind()
{
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('mouseenter', onMouseUp);
    canvas.removeEventListener('mouseleave', onMouseUp);

    canvas.removeEventListener("touchmove", onMouseMove);
    canvas.removeEventListener("touchend", onMouseUp);
    canvas.removeEventListener('touchstart', onMouseDown);
}

active.onChange=function()
{
    if(active.get())bind();
    else unbind();
};


op.onDelete=function()
{
    unbind();
};

