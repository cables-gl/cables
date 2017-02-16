op.name="ArcBall";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var mulRotate=op.addInPort(new Port(op,"Mul Rotate",OP_PORT_TYPE_VALUE));
var mulScale=op.addInPort(new Port(op,"Mul Scale",OP_PORT_TYPE_VALUE));

var minScale=op.addInPort(new Port(op,"Min Scale",OP_PORT_TYPE_VALUE));
var maxScale=op.addInPort(new Port(op,"Max Scale",OP_PORT_TYPE_VALUE));

var useWheel=op.inValueBool('Use Mouse Wheel',true);

var inRadius=op.inValue("Radius",1);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

mulRotate.set(1);
mulScale.set(1);
minScale.set(0.1);
maxScale.set(1.5);

var cgl=op.patch.cgl;
vScale=vec3.create();
var mouseDown=false;
var radius=1.0;

var startX=-1;
var startY=-1;
var lastMouseX=-1;
var lastMouseY=-1;

var finalRotMatrix = mat4.create();

inRadius.onChange=function()
{
    radius=inRadius.get()||1;
};

render.onTriggered=function()
{
    cgl.pushViewMatrix();
    cgl.pushModelMatrix();

    if(inRadius.get()===0)
    {
        if(radius<minScale.get())radius=minScale.get();
        if(radius>maxScale.get())radius=maxScale.get();
        
    }

    mat4.multiply(cgl.vMatrix,cgl.vMatrix,finalRotMatrix);
    var r=radius;
    vec3.set(vScale, r,r,r);
    
    mat4.scale(cgl.vMatrix,cgl.vMatrix, vScale);

    trigger.trigger();
    cgl.popViewMatrix();
    cgl.popModelMatrix();
};

function touchToMouse(event)
{
    event.offsetX = event.pageX - event.target.offsetLeft;     
    event.offsetY = event.pageY - event.target.offsetTop;
    event.which=1;

    if(startX==-1 && startY==-1 && event.offsetX==event.offsetX && event.offsetY==event.offsetY)
    {
        lastMouseX=startX=event.offsetX;
        lastMouseY=startY=event.offsetY;
        // console.log("STARTED TOUCH...");
    }

    if(event.offsetX!=event.offsetX)event.offsetX=0;
    if(event.offsetY!=event.offsetY)event.offsetY=0;

    return event;
}

function onTouchMove(event)
{
    // console.log(event);
    
    for(var i=0;i<event.touches.length;i++)
    {
        var e=touchToMouse(event.touches[i]);
        
        if(e.offsetX==e.offsetX && e.offsetY==e.offsetY)
            onmousemove(e);
        console.log(e);
    }
    event.preventDefault();
    // onmousemove('event',event);
}

function onmousemove(event)
{
    if(!mouseDown) return;

    if(lastMouseX==-1 && lastMouseY==-1)return;

    var x = event.offsetX;
    var y = event.offsetY;
    
    if(event.which==3)
    {
        // vOffset[2]+=(x-lastMouseX)*0.01*mulTrans.get();
        // vOffset[1]+=(y-lastMouseY)*0.01*mulTrans.get();
    }

    if(inRadius.get()===0)
    {
        if(event.which==2)
        {
            radius-=(y-lastMouseY)*0.001*mulScale.get();
        }
    }

    if(event.which==1)
    {
        var deltaX = x - lastMouseX;

        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix,newRotationMatrix,CGL.DEG2RAD*(deltaX / 10)*mulRotate.get(), [0, 1, 0]);

        var deltaY = y - lastMouseY;
        mat4.rotate(newRotationMatrix,newRotationMatrix, CGL.DEG2RAD*(deltaY / 10)*mulRotate.get(), [1, 0, 0]);

        mat4.multiply(finalRotMatrix,newRotationMatrix, finalRotMatrix);

        lastMouseX = x;
        lastMouseY = y;
    }
    
    lastMouseX=x;
    lastMouseY=y;
}

function onMouseDown(event)
{
    startX = event.offsetX;
    startY = event.offsetY;

    lastMouseX = event.offsetX;
    lastMouseY = event.offsetY;

    mouseDown=true;
}

function onMouseUp(event)
{
    mouseDown=false;
}

function onMouseEnter(event)
{
}

var onMouseWheel=function(event)
{
    if(useWheel.get())
    {
        var delta=CGL.getWheelSpeed(event)*0.001;
        radius+=(parseFloat(delta)*mulScale.get());
        event.preventDefault();
    }
};


function touchStart(event)
{
    mouseDown=true;
    event.preventDefault();
}

function touchEnd(event)
{
    mouseDown=false;
    startX=-1;
    startY=-1;
    event.preventDefault();
    
}

cgl.canvas.addEventListener("touchmove", onTouchMove);
cgl.canvas.addEventListener("touchstart", touchStart);
cgl.canvas.addEventListener("touchend", touchEnd);

cgl.canvas.addEventListener('mousemove', onmousemove);
cgl.canvas.addEventListener('mousedown', onMouseDown);
cgl.canvas.addEventListener('mouseup', onMouseUp);
cgl.canvas.addEventListener('mouseleave', onMouseUp);
cgl.canvas.addEventListener('mouseenter', onMouseEnter);
cgl.canvas.addEventListener('contextmenu', function(e){e.preventDefault();});
cgl.canvas.addEventListener('wheel', onMouseWheel);

op.onDelete=function()
{
    cgl.canvas.removeEventListener("touchmove", onTouchMove);
    cgl.canvas.removeEventListener("touchstart", touchStart);
    cgl.canvas.removeEventListener("touchend", touchEnd);

    cgl.canvas.removeEventListener('mousemove', onmousemove);
    cgl.canvas.removeEventListener('mousedown', onMouseDown);
    cgl.canvas.removeEventListener('mouseup', onMouseUp);
    cgl.canvas.removeEventListener('mouseleave', onMouseUp);
    cgl.canvas.removeEventListener('mouseenter', onMouseUp);
    cgl.canvas.removeEventListener('wheel', onMouseWheel);
    cgl.canvas.style.cursor='auto';
};

