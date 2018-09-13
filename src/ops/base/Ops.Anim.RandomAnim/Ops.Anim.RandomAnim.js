
var exe=op.inFunction("exe");
var min=op.inValue("min",0);
var max=op.inValue("max",1);

var pause=op.inValue("pause between",0);
var seed=op.inValue("random seed",0);

var duration=op.inValue("duration",0.5);

var result=op.outValue("result");

var anim=new CABLES.TL.Anim();
anim.createPort(op,"easing",reinit);

reinit();

min.onChange=reinit;
max.onChange=reinit;
pause.onChange=reinit;
seed.onChange=reinit;
duration.onChange=reinit;

var counter=0;

function getRandom()
{
    var minVal = parseFloat( min.get() );
    var maxVal = parseFloat( max.get() );
    return Math.seededRandom() * ( maxVal - minVal ) + minVal;
}

function reinit()
{
    Math.randomSeed=seed.get()+counter*100;
    init(getRandom());
}

function init(v)
{
    anim.clear();
    
    anim.setValue(op.patch.freeTimer.get(), v);
    if(pause.get()!=0.0)anim.setValue(op.patch.freeTimer.get()+pause.get(), v);
    
    anim.setValue(parseFloat(duration.get())+op.patch.freeTimer.get()+pause.get(), getRandom());
}


exe.onTriggered=function()
{
    var t=op.patch.freeTimer.get();
    var v=anim.getValue(t);
    if(anim.hasEnded(t))
    {
        counter++;
        anim.clear();
        init(v);
    }
    result.set(v);
};

