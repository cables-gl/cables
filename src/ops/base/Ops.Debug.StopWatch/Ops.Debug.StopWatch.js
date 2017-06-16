op.name="StopWatch";

var exec=op.inFunction("exec");
var next=op.outFunction("next");
var timeUsed=op.outValue("Time used");

exec.onTriggered=function()
{
    var start=performance.now();
    next.trigger();
    var end=performance.now();
    
    timeUsed.set(end-start);
    
};