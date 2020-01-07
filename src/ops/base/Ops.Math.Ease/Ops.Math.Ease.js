const
    inVal=op.inValue("Value"),
    inMin=op.inValue("Min",0),
    inMax=op.inValue("Max",1),
    result=op.outValue("Result"),
    anim=new CABLES.Anim();

anim.createPort(op,"Easing",updateAnimEasing);
anim.setValue(0,0);
anim.setValue(1,1);

op.onLoaded=inMin.onChange=inMax.onChange=updateMinMax;

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
    const r=anim.getValue(inVal.get());
    result.set(r);
};