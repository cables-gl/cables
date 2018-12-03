var exe=op.inTrigger("exe");

var number=op.inValue("number",0);
var min=op.inValue("min",0);
var max=op.inValue("max",1);

var triggerThen=op.outTrigger('then');
var triggerElse=op.outTrigger('else');
var outBetween=op.outValue("bs between");

exe.onTriggered=function()
{
    if(number.get()>=min.get() && number.get()<max.get())
    {
        outBetween.set(true);
        triggerThen.trigger();
    }
    else
    {
        outBetween.set(false);
        triggerElse.trigger();
    }
};
