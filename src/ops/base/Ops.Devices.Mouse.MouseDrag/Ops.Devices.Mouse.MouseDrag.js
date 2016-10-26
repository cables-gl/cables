op.name="MouseDrag";

var canvas=op.patch.cgl.canvas;

var mul=op.inValue("mul",1);

var outX=op.addOutPort(new Port(op,"x"));
var outY=op.addOutPort(new Port(op,"y"));
var cgl=op.patch.cgl;
var flipY=op.inValueBool("Flip Y",true);
var kinetic=op.inValueBool("Kinetic",true);

var doReset=op.inFunction("Reset");

outY.ignoreValueSerialize=true;
outX.ignoreValueSerialize=true;

var pressed=false;

var lastY=-1;
var lastX=-1;

outX.set(0);
outY.set(0);

var animX=new CABLES.InertiaAnim(updateKineticX);
var animY=new CABLES.InertiaAnim(updateKineticY);

animX.smoothSpeed=0.0000001;
animY.smoothSpeed=0.0000001;


doReset.onTriggered=function()
{
    lastY=-1;
    lastX=-1;

    outX.set(0);
    outY.set(0);

    // console.log('reset!');
};

function updateKineticX(v)
{
    outX.set(v);
}

function updateKineticY(v)
{
    outY.set(v);
}

function onmouseclick()
{
    
}


function onmousemove(e)
{
    
    // if(outX.get()===undefined)outX.set(0);
    // if(outY.get()===undefined)outY.set(0);
    
    var clientY=e.clientY;
    if(flipY.get()) clientY=cgl.canvas.clientHeight-clientY;



    if(pressed)
    {
        if(lastX!=-1)
        {


            if(kinetic.get())
            {

                var x=(animX.get()+(e.clientX-lastX)*mul.get());
                var y=(animY.get()+(clientY-lastY)*mul.get());

                animX.set(x);
                animY.set(y);
            }
            else
            {
                var x=(outX.get()+(e.clientX-lastX)*mul.get());
                var y=(outY.get()+(clientY-lastY)*mul.get());

                if(!isNaN(x))outX.set(x||0);
                    else outX.set(0);
    
                if(!isNaN(y))outY.set(y||0);
                    else outY.set(0);
                
            }


        }

        lastY=clientY;
        lastX=e.clientX;
    }
}

function onMouseLeave(e)
{
    onMouseUp(e);
}

function onMouseDown(e)
{
    pressed=true;
}

function onMouseUp(e)
{
    if(kinetic.get())
    {
        animX.release();
        animY.release();
    }

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
