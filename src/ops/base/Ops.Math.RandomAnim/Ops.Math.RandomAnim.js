op.name='random anim';

var exe=op.inFunction("exe");
var min=op.inValue("min",0);
var max=op.inValue("max",1);
var duration=op.inValue("duration",0.5);

var result=op.outValue("result");

var anim=new CABLES.TL.Anim();
anim.createPort(op,"easing",init);

init();

min.onChange=init;
max.onChange=init;
duration.onChange=init;

function getRandom()
{
    var minVal = parseFloat( min.get() );
    var maxVal = parseFloat( max.get() );
    return Math.seededRandom() * ( maxVal - minVal ) + minVal;
}

function init(v)
{
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

