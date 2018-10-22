op.name="ArcBall";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var useWheel=op.inValueBool('Use Mouse Wheel',true);
var minRadius=op.inValue("Min Radius",0.1);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var outRadius=op.outValue("Radius");

var cgl=op.patch.cgl;
var vScale=vec3.create();
var mouseDown=false;
var radius=0.0;

var startX=-1;
var startY=-1;
var lastMouseX=-1;
var lastMouseY=-1;

var finalRotMatrix = mat4.create();

render.onTriggered=function()
{
    cgl.pushViewMatrix();

    var r=radius*30.0+minRadius.get();

    if(r<minRadius.get())
    {
        r=minRadius.get();
        radius=0;
    }
    outRadius.set(r);
    vec3.set(vScale, vOffset[1],-vOffset[0],-r );

    // vec3.set(vScale, 0,0,-r );
    
    mat4.translate(cgl.vMatrix,cgl.vMatrix, vScale);    
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,finalRotMatrix);

    // vec3.set(vScale, -vOffset[1],-vOffset[0],0 );
    // mat4.translate(cgl.vMatrix,cgl.vMatrix, vScale);

    trigger.trigger();
    cgl.popViewMatrix();

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
        // console.log(e);
    }
    event.preventDefault();
    // onmousemove('event',event);
}

var vOffset=[0,0];

function onmousemove(event)
{
    if(!mouseDown) return;

    if(lastMouseX==-1 && lastMouseY==-1)return;

    var x = event.offsetX;
    var y = event.offsetY;

    if(event.which==3)
    {
        vOffset[1]+=(x-lastMouseX)*0.01;
        vOffset[0]+=(y-lastMouseY)*0.01;
    }


    if(event.which==1)
    {
        var deltaX = x - lastMouseX;

        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        // vec3.set(vScale, -vOffset[1],-vOffset[0],0 );
        // mat4.translate(newRotationMatrix,newRotationMatrix, vScale);

        mat4.rotate(newRotationMatrix,newRotationMatrix,CGL.DEG2RAD*(deltaX / 10), [0, 1, 0]);

        var deltaY = y - lastMouseY;
        mat4.rotate(newRotationMatrix,newRotationMatrix, CGL.DEG2RAD*(deltaY / 10), [1, 0, 0]);

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
        radius+=(parseFloat(delta));
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
