
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var segments=op.addInPort(new Port(op,"segments"));
var radius=op.addInPort(new Port(op,"radius"));
var mulX=op.addInPort(new Port(op,"mulX"));
var mulY=op.addInPort(new Port(op,"mulY"));
var percent=op.addInPort(new Port(op,"percent",OP_PORT_TYPE_VALUE,{display:'range'}));

var offset=op.addInPort(new Port(op,"offset"));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var index=op.addOutPort(new Port(op,"index"));

var outX=op.addOutPort(new Port(op,"X"));
var outY=op.addOutPort(new Port(op,"Y"));


var speed=op.inValue("speed",1);

var startTime=CABLES.now()/1000;
var cgl=op.patch.cgl;
var animX=new CABLES.TL.Anim();
var animY=new CABLES.TL.Anim();
var pos=[];
animX.loop=true;
animY.loop=true;

segments.set(40);
radius.set(1);
mulX.set(1);
mulY.set(1);

segments.onValueChanged=calc;

calc();

render.onTriggered=function()
{
    cgl.pushModelMatrix();


    var time=(CABLES.now()/1000-startTime)*speed.get()+Math.round(segments.get())*0.1*percent.get();

    var x=animX.getValue(time+offset.get())*mulX.get()*radius.get();
    var y=animY.getValue(time+offset.get())*mulY.get()*radius.get();

    outX.set(x);
    outY.set(y);

    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, [
        x,
        y,
        0] );

    trigger.trigger();

    cgl.popModelMatrix();
};

function calc()
{
    pos.length=0;
    var i=0,degInRad=0;
    animX.clear();
    animY.clear();

    for (i=0; i <= Math.round(segments.get()); i++)
    {
        index.set(i);
        degInRad = (360/Math.round(segments.get()))*i*CGL.DEG2RAD;
        animX.setValue(i*0.1,Math.cos(degInRad));
        animY.setValue(i*0.1,Math.sin(degInRad));
    }
}

