
var exe=op.inTrigger("Update");
var v=op.inValue("Value",0);
var delay=op.inValue("Delay",0.5);
var result=op.outValue("Result",0);
var clear=op.inValueBool("Clear on Change",true);

var anim=new CABLES.TL.Anim();
anim.createPort(op,"easing",function(){}).set("absolute");

exe.onTriggered=function()
{
    result.set(anim.getValue( op.patch.freeTimer.get() )||0);
};

v.onChange=function()
{
    var current=anim.getValue( op.patch.freeTimer.get() );
    var t=op.patch.freeTimer.get();

    if(clear.get()) anim.clear(t);

    anim.setValue(t+delay.get(),v.get());
};