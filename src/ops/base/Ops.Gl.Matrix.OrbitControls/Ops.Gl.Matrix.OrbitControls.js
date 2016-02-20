this.name="orbital controls";
var cgl=this.patch.cgl;
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var eye=vec3.create();
var vUp=vec3.create();
var vCenter=vec3.create();
var transMatrix=mat4.create();

var mouseDown=false;
var radius=5;
var lastMouseX=0,lastMouseY=0;
var percX=0,percY=0;


vec3.set(vCenter, 0,0,0);
vec3.set(vUp, 0,1,0);


render.onTriggered=function()
{
    cgl.pushMvMatrix();

    mat4.lookAt(transMatrix, eye, vCenter, vUp);
    mat4.rotate(transMatrix, transMatrix, percX, vUp);
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);

    trigger.trigger();
    cgl.popMvMatrix();
};


function circlePos(perc)
{
    var i=0,degInRad=0;
    var vec=vec3.create();
    degInRad = 360*perc/2*CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad)*radius,
        Math.sin(degInRad)*radius,
        0);
    return vec;
}

var onmousemove = function(e)
{
    if(!mouseDown) return;

    var x = event.clientX;
    var y = event.clientY;
    
    if(e.which==3)
    {
        radius+=(y-lastMouseY)*0.06;
        if(radius<0.5)radius=0.06;
        eye=circlePos(percY);
    }
    else
    {
        percX+=(x-lastMouseX)*0.0025;
        percY+=(y-lastMouseY)*0.0025;
        if(percY>0.5)percY=0.5;
        if(percY<-0.5)percY=-0.5;
        eye=circlePos(percY);
    }

    lastMouseX=x;
    lastMouseY=y;
};

function onMouseDown(e)
{
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    mouseDown=true;
}

function onMouseUp()
{
    mouseDown=false;
}

cgl.canvas.addEventListener('mousemove', onmousemove);
cgl.canvas.addEventListener('mousedown', onMouseDown);
cgl.canvas.addEventListener('mouseup', onMouseUp);
cgl.canvas.addEventListener('mouseleave', onMouseUp);
cgl.canvas.addEventListener('mouseenter', onMouseUp);
cgl.canvas.addEventListener('contextmenu', function(e){e.preventDefault();});

this.onDelete=function()
{
    console.log("remove arcball op...");
    cgl.canvas.removeEventListener('mousemove', onmousemove);
    cgl.canvas.removeEventListener('mousedown', onMouseDown);
    cgl.canvas.removeEventListener('mouseup', onMouseUp);
    cgl.canvas.removeEventListener('mouseleave', onMouseUp);
    cgl.canvas.removeEventListener('mouseenter', onMouseUp);
};

eye=circlePos(0);



