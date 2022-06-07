var render=op.inTrigger('render');
var segments=op.inValueInt("segments",40);
var radius=op.inValueFloat("radius",1);
var mulX=op.inValueFloat("mulX",1);
var mulY=op.inValueFloat("mulY",1);
var percent=op.inValueSlider("percent");
var offset=op.inValueFloat("offset");
var trigger=op.outTrigger('trigger');
var index=op.outValue("index");
var outX=op.outValue("X");
var outY=op.outValue("Y");
var speed=op.inValue("speed",1);

var startTime=CABLES.now()/1000;
var cgl=op.patch.cgl;
var animX=new CABLES.Anim();
var animY=new CABLES.Anim();
var pos=[];
animX.loop=true;
animY.loop=true;

segments.onChange=calc;

calc();

render.onTriggered=function()
{
    cgl.pushModelMatrix();

    var time=(CABLES.now()/1000-startTime)*speed.get()+Math.round(segments.get())*0.1*percent.get();

    var x=animX.getValue(time+offset.get())*mulX.get()*radius.get();
    var y=animY.getValue(time+offset.get())*mulY.get()*radius.get();

    outX.set(x);
    outY.set(y);

    mat4.translate(cgl.mMatrix,cgl.mMatrix, [x,y,0] );

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

