
var inExec=op.inTriggerButton("Exec");

var inArr=op.inArray("Array");
var result=op.outArray("Result");

inExec.onTriggered=function()
{
    result.set(null);
    result.set(inArr.get());
};