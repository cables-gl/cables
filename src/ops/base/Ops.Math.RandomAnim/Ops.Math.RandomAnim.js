op.name='random anim';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var result=op.addOutPort(new Port(op,"result"));

var min=op.addInPort(new Port(op,"min"));
var max=op.addInPort(new Port(op,"max"));
var duration=op.addInPort(new Port(op,"duration"));

var anim=new CABLES.TL.Anim();

var easing=op.addInPort(new Port(op,"easing",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["linear","smoothstep","smootherstep","absolute"]} ));
easing.set('linear');


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
    anim.setValue(Date.now()/1000.0, v);
    anim.setValue(parseFloat(duration.get())+Date.now()/1000.0, getRandom());
}

exe.onTriggered=function()
{
    var t=Date.now()/1000;
    var v=anim.getValue(t);
    if(anim.hasEnded(t))
    {
        anim.clear();
        init(v);
    }
    result.set(v);
};

min.set(0.0);
max.set(1.0);
duration.set(0.5);
init();

min.onValueChange(init);
max.onValueChange(init);
duration.onValueChange(init);
easing.onValueChange(init);
