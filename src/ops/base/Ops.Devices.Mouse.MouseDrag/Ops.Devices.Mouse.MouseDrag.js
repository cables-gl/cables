op.name="MouseDrag";

var canvas=op.patch.cgl.canvas;

var outY=op.addOutPort(new Port(op,"y"));
var outX=op.addOutPort(new Port(op,"x"));

var pressed=false;

var lastY=-1;
var lastX=-1;

function onmouseclick()
{
    
}

function onmousemove(e)
{
    if(pressed)
    {
        if(lastX!=-1)
        {
            outY.set(outY.get()+e.clientY-lastY);
            outX.set(outX.get()+e.clientX-lastX);
        }

        lastY=e.clientY;
        lastX=e.clientX;
    }
}

function onMouseLeave()
{
    onMouseUp();
}

function onMouseDown()
{
    pressed=true;
}

function onMouseUp()
{
    lastX=-1;
    lastY=-1;
    pressed=false;
}

function onMouseEnter()
{
    
}


canvas.addEventListener('click', onmouseclick);
canvas.addEventListener('mousemove', onmousemove);
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mouseenter', onMouseEnter);
canvas.addEventListener('mouseleave', onMouseLeave);
// canvas.addEventListener('contextmenu', onClickRight);


op.onDelete=function()
{
    console.log("remove mouse op...");
    canvas.removeEventListener('click', onmouseclick);
    canvas.removeEventListener('mousemove', onmousemove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('mouseenter', onMouseEnter);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    // canvas.removeEventListener('contextmenu', onClickRight);
};
