
op.name='if between then';
var exe=op.inFunction("exe");

var number=op.inValue("number",0);
var min=op.inValue("min",0);
var max=op.inValue("max",1);

var triggerThen=op.outFunction('then');
var triggerElse=op.outFunction('else');

exe.onTriggered=function()
{
    if(number.get()>=min.get() && number.get()<max.get()) triggerThen.trigger();
        else triggerElse.trigger();
};
