op.name="MouseDrag";

var canvas=op.patch.cgl.canvas;

var mul=op.addInPort(new Port(op,"mul"));

var outX=op.addOutPort(new Port(op,"x"));
var outY=op.addOutPort(new Port(op,"y"));
var cgl=op.patch.cgl;
var flipY=op.inValueBool("Flip Y");

var doReset=op.inFunction("Reset");

outY.ignoreValueSerialize=true;
outX.ignoreValueSerialize=true;

var pressed=false;

var lastY=-1;
var lastX=-1;

outX.set(0);
outY.set(0);


doReset.onTriggered=function()
{
    lastY=-1;
    lastX=-1;

    outX.set(0);
    outY.set(0);
    
    // console.log('reset!');
};

function onmouseclick()
{
    
}

// function fix()
// {
//     if(outX.get()===undefined)outX.set(0);
//     if(outY.get()===undefined)outY.set(0);

// }

// outX.onValueChanged=fix;
// outY.onValueChanged=fix;

function onmousemove(e)
{
    
    if(outX.get()===undefined)outX.set(0);
    if(outY.get()===undefined)outY.set(0);
    
    var clientY=e.clientY;
    if(flipY.get()) clientY=cgl.canvas.clientHeight-clientY;


    if(pressed)
    {
        if(lastX!=-1)
        {
            

            var x=(outX.get()+(e.clientX-lastX)*mul.get());
            var y=(outY.get()+(clientY-lastY)*mul.get());

            if(!isNaN(x))outX.set(x||0);
                else outX.set(0);

            

            if(!isNaN(y))outY.set(y||0);
                else outY.set(0);
        }

        lastY=clientY;
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
