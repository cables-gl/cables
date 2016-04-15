
this.name='Circle Movement';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

var segments=this.addInPort(new Port(this,"segments"));
var radius=this.addInPort(new Port(this,"radius"));
var mulX=this.addInPort(new Port(this,"mulX"));
var mulY=this.addInPort(new Port(this,"mulY"));
var percent=this.addInPort(new Port(this,"percent",OP_PORT_TYPE_VALUE,{display:'range'}));

var offset=this.addInPort(new Port(this,"offset"));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var index=this.addOutPort(new Port(this,"index"));

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

