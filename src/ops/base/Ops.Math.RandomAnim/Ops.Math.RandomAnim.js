op.name='random anim';

var exe=op.inFunction("exe");
var min=op.inValue("min",0);
var max=op.inValue("max",1);
var duration=op.inValue("duration",0.5);

var result=op.outValue("result");

var anim=new CABLES.TL.Anim();

var easing=op.addInPort(new Port(op,"easing",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["linear","smoothstep","smootherstep","absolute"]} ));
easing.set('linear');

init();

min.onChange=init;
max.onChange=init;
duration.onChange=init;
easing.onChange=init;


function getRandom()
{
    var minVal = parseFloat( min.get() );
    var maxVal = parseFloat( max.get() );
    return Math.seededRandom() * ( maxVal - minVal ) + minVal;
}

function init(v)
{
    if(easing.get()=='linear') anim.defaultEasing=CABLES.TL.EASING_LINEAR;
    if(easing.get()=='smoothstep') anim.defaultEasing=CABLES.TL.EASING_SMOOTHSTEP;
    if(easing.get()=='smootherstep') anim.defaultEasing=CABLES.TL.EASING_SMOOTHERSTEP;
    if(easing.get()=='absolute') anim.defaultEasing=CABLES.TL.EASING_ABSOLUTE;

    anim.clear();
    if(v===undefined) v=getRandom();
    anim.setValue(op.patch.freeTimer.get(), v);
    anim.setValue(parseFloat(duration.get())+op.patch.freeTimer.get(), getRandom());
}

exe.onTriggered=function()
{
    var t=op.patch.freeTimer.get();
    var v=anim.getValue(t);
    if(anim.hasEnded(t))
    {
        anim.clear();
        init(v);
    }
    result.set(v);
};

