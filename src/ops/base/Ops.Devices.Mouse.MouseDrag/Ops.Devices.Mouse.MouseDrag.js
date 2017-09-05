op.name="MouseDrag";

var canvas=op.patch.cgl.canvas;

var outX=op.addOutPort(new Port(op,"x"));
var outY=op.addOutPort(new Port(op,"y"));
var flipY=op.inValueBool("Flip Y",true);
var kinetic=op.inValueBool("Inertia Movement",true);
var limit=op.inValueBool("Limit");

var doReset=op.inFunctionButton("Reset");

var mul=op.inValue("mul",0.1);

var minX=op.inValue("minX",-600);
var maxX=op.inValue("maxX",600);
var minY=op.inValue("minY",-600);
var maxY=op.inValue("maxY",600);

var active=op.inValueBool("Active",true);

var isMoving=op.outValue("isMoving");
var isPressed=op.outValue("isPressed");

var cgl=op.patch.cgl;

outY.ignoreValueSerialize=true;
outX.ignoreValueSerialize=true;

var pressed=false;

var lastY=-1;
var lastX=-1;

outX.set(0);
outY.set(0);

var animX=new CABLES.InertiaAnim(updateKineticX);
var animY=new CABLES.InertiaAnim(updateKineticY);


doReset.onTriggered=function()
{
    lastY=-1;
    lastX=-1;

    outX.set(0);
    outY.set(0);
    
    if(kinetic.get())
    {
        animX.set(0);
        animY.set(0);
    }
};

function updateKineticX(v)
{
    if(limit.get())
    {
        if(v>maxX.get())v=maxX.get();
        if(v<minX.get())v=minX.get();
    }

    outX.set(v*mul.get());
}

function updateKineticY(v)
{
    if(limit.get())
    {
        if(v>maxY.get())v=maxY.get();
        if(v<minY.get())v=minY.get();
    }

    outY.set(v*mul.get());
}

function onmouseclick()
{
    
}

var movingTimeout=0;
function seMoving()
{
    isMoving.set(true);
    clearTimeout(movingTimeout);
    movingTimeout=setTimeout(
        function()
        {
            isMoving.set(false);
        },60);
}

function onmousemove(e)
{
    var clientY=e.clientY;
    if(flipY.get()) clientY=cgl.canvas.clientHeight-clientY;

    if(pressed)
    {
        seMoving();
        
        if(lastX!=-1)
        {
            if(kinetic.get())
            {

                var deltaX=(e.clientX-lastX);
                var deltaY=(clientY-lastY);

                var x=(animX.get()+deltaX);
                var y=(animY.get()+deltaY);

                if(x!=x)x=0;
                x=x||0;

                if(y!=y)y=0;
                y=y||0;

                if(x>maxX.get())x=maxX.get();
                if(x<minX.get())x=minX.get();
                if(y<minY.get())y=minY.get();
                if(y>maxY.get())y=maxY.get();

                animX.set(x);
                animY.set(y);
            }
            else
            {
                var x=(outX.get()+(e.clientX-lastX));
                var y=(outY.get()+(clientY-lastY));

                if(x!=x)x=0;
                x=x||0;

                if(y!=y)y=0;
                y=y||0;

                if(x<minX.get())x=minX.get();
                if(x>maxX.get())x=maxX.get();
                if(y<minY.get())y=minY.get();
                if(y>maxY.get())y=maxY.get();

                outX.set(x);
                outY.set(y);
            }
        }

        lastY=clientY;
        lastX=e.clientX;
    }
}

function onMouseLeave(e)
{
    onMouseUp(e);
    isPressed.set(false);
}

function onMouseDown(e)
{
    pressed=true;
    isPressed.set(true);
}

function onMouseUp(e)
{
    if(kinetic.get())
    {
        animX.release();
        animY.release();
    }
    
    isPressed.set(false);
    lastX=-1;
    lastY=-1;
    pressed=false;
}

function onMouseEnter()
{
    
}

function bind()
{
    canvas.addEventListener('click', onmouseclick);
    canvas.addEventListener('mousemove', onmousemove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseenter', onMouseEnter);
    canvas.addEventListener('mouseleave', onMouseLeave);

    canvas.addEventListener("touchmove", onmousemove);
    canvas.addEventListener("touchstart", onMouseDown);
    canvas.addEventListener("touchend", onMouseUp);
}

function unbind()
{
    console.log("remove mouse op...");
    canvas.removeEventListener('click', onmouseclick);
    canvas.removeEventListener('mousemove', onmousemove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('mouseenter', onMouseEnter);
    canvas.removeEventListener('mouseleave', onMouseLeave);
}

active.onChange=function()
{
    if(active.get())bind();
    else unbind();
}

bind();

op.onDelete=function()
{
    unbind();
};
