
op.name='Circle Movement';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var segments=op.addInPort(new Port(op,"segments"));
var radius=op.addInPort(new Port(op,"radius"));
var mulX=op.addInPort(new Port(op,"mulX"));
var mulY=op.addInPort(new Port(op,"mulY"));
var percent=op.addInPort(new Port(op,"percent",OP_PORT_TYPE_VALUE,{display:'range'}));

var offset=op.addInPort(new Port(op,"offset"));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var index=op.addOutPort(new Port(op,"index"));

var startTime=Date.now()/1000;
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
radius.onValueChanged=calc;

calc();

render.onTriggered=function()
{
    cgl.pushMvMatrix();

    var time=Date.now()/1000-startTime+Math.round(segments.get())*0.1*percent.get();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, [
        animX.getValue(time+offset.get())*mulX.get(),
        animY.getValue(time+offset.get())*mulY.get(),
        0] );

    trigger.trigger();

    cgl.popMvMatrix();
};

function calc()
{
    pos.length=0;
    var i=0,degInRad=0;
    animX.clear();
    animY.clear();

    for (i=0; i <= Math.round(segments.get()); i++)
    {
        degInRad = (360/Math.round(segments.get()))*i*CGL.DEG2RAD;
        animX.setValue(i*0.1,Math.cos(degInRad)*radius.get());
        animY.setValue(i*0.1,Math.sin(degInRad)*radius.get());
    }
}

