op.name="MetroControls";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var minDist=op.addInPort(new Port(op,"min distance",OP_PORT_TYPE_VALUE));
var initialAxis=op.addInPort(new Port(op,"initial axis y",OP_PORT_TYPE_VALUE,{display:'range'}));
var initialX=op.addInPort(new Port(op,"initial axis x",OP_PORT_TYPE_VALUE,{display:'range'}));
var mul=op.addInPort(new Port(op,"mul",OP_PORT_TYPE_VALUE));
var addRadius=op.addInPort(new Port(op,"Add Radius",OP_PORT_TYPE_VALUE));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var outRadius=op.addOutPort(new Port(op,"radius",OP_PORT_TYPE_VALUE));

mul.set(1);
minDist.set(0.005);
initialAxis.set(0.5);
initialX.set(0.0);

var cgl=op.patch.cgl;
var eye=vec3.create();
var vUp=vec3.create();
var vCenter=vec3.create();
var transMatrix=mat4.create();
var vOffset=vec3.create();

var mouseDown=false;
var radius=5;
outRadius.set(radius);

var lastMouseX=0,lastMouseY=0;
var percX=0,percY=0;

vec3.set(vCenter, 0,0,0);
vec3.set(vUp, 0,1,0);

var tempEye=vec3.create();
var tempCenter=vec3.create();

render.onTriggered=function()
{
    cgl.pushViewMatrix();

    vec3.add(tempEye, eye, vOffset);
    vec3.add(tempCenter, vCenter, vOffset);

    mat4.lookAt(transMatrix, tempEye, tempCenter, vUp);
    // mat4.rotate(transMatrix, transMatrix, percX, vUp);
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
};


function circlePos(perc)
{
    if(radius < minDist.get() * mul.get()) radius = minDist.get() * mul.get();
    
    outRadius.set(radius*mul.get());
    
    var i=0,degInRad=0;
    var vec=vec3.create();
    degInRad = 360*perc/2*CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad)*(radius + addRadius.get())*mul.get(),
        Math.sin(degInRad)*(radius + addRadius.get())*mul.get(),
        0);
    return vec;
}

addRadius.onValueChanged=function()
{
    eye=circlePos(percY);
};

var onmousemove = function(e)
{
    if(!mouseDown) return;

    var x = event.clientX;
    var y = event.clientY;
    
    if(e.which==1)
    {
        vOffset[2]+=(x-lastMouseX)*0.001*mul.get()*radius;
        vOffset[1]+=(y-lastMouseY)*0.001*mul.get()*radius;
        
        // if(vOffset[2]>20)vOffset[2]=20;
        // if(vOffset[2]<-20)vOffset[2]=-20;
        // if(vOffset[1]>12)vOffset[1]=12;
        // if(vOffset[1]<-12)vOffset[1]=-12;
        
        eye=circlePos(percY);
    }
    else
    if(e.which==2)
    {
        radius+=(y-lastMouseY)*0.05;

        eye=circlePos(percY);
    }
    else
    {
        percX+=(x-lastMouseX)*0.001;
        percY+=(y-lastMouseY)*0.001;
        if(percY>0)percY=0;
        if(percY<-0.4)percY=-0.4;
        eye=circlePos(percY);
    }

    lastMouseX=x;
    lastMouseY=y;
};

function onMouseDown(e)
{
    cgl.canvas.style.cursor='none';
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    mouseDown=true;
}

function onMouseUp()
{
    mouseDown=false;
    cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';
}

function onMouseEnter(e)
{
    cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';
}

initialX.onValueChange(function()
{
    percX=(initialX.get()*Math.PI*2);
    
});

initialAxis.onValueChange(function()
{
    percY=(initialAxis.get()-0.5);
    eye=circlePos( percY );
});

var onMouseWheel=function(e)
{
    var wheelDistance = function(evt)
    {
      if (!evt) evt = event;
      var w=evt.wheelDelta, d=evt.detail;
      if (d){
        if (w) return w/d/40*d>0?1:-1; // Opera
        else return -d/3;              // Firefox;         TODO: do not /3 for OS X
      } else return w/120;             // IE/Safari/Chrome TODO: /3 for Chrome OS X
    };

    var delta=parseFloat( wheelDistance(e))*-0.06;
    radius+=(parseFloat(delta))*1.2 ;

    if(radius>33)radius=33.0;

    eye=circlePos(percY);
    e.preventDefault();
};


cgl.canvas.addEventListener('mousemove', onmousemove);
cgl.canvas.addEventListener('mousedown', onMouseDown);
cgl.canvas.addEventListener('mouseup', onMouseUp);
cgl.canvas.addEventListener('mouseleave', onMouseUp);
cgl.canvas.addEventListener('mouseenter', onMouseEnter);
cgl.canvas.addEventListener('contextmenu', function(e){e.preventDefault();});
cgl.canvas.addEventListener('wheel', onMouseWheel);

op.onDelete=function()
{
    cgl.canvas.removeEventListener('mousemove', onmousemove);
    cgl.canvas.removeEventListener('mousedown', onMouseDown);
    cgl.canvas.removeEventListener('mouseup', onMouseUp);
    cgl.canvas.removeEventListener('mouseleave', onMouseUp);
    cgl.canvas.removeEventListener('mouseenter', onMouseUp);
    cgl.canvas.removeEventListener('wheel', onMouseWheel);
    cgl.canvas.style.cursor='auto';
};

eye=circlePos(0);



