var inVal=op.inValue("Value");

var inMin=op.inValue("Min",0);
var inMax=op.inValue("Max",1);

var result=op.outValue("Result");

var anim=new CABLES.TL.Anim();

anim.createPort(op,"Easing",updateAnimEasing);

anim.setValue(0,0);
anim.setValue(1,1);

inMin.onChange=inMax.onChange=updateMinMax;

function updateMinMax()
{
    anim.keys[0].time=anim.keys[0].value=Math.min(inMin.get(),inMax.get());
    anim.keys[1].time=anim.keys[1].value=Math.max(inMin.get(),inMax.get());
}

function updateAnimEasing()
{
    anim.keys[0].setEasing(anim.defaultEasing);    
}


inVal.onChange=function()
{
    var v=inVal.get();
    var r=anim.getValue(v);
    result.set(r);

};