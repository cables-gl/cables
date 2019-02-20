
var inExec=op.inTriggerButton("Exec");

var inArr=op.inArray("Array");
var result=op.outArray("Result");

inExec.onTriggered=function()
{
    const arrValue = inArr.get();
    if(!arrValue) result.set(null);
    result.set(inArr.get());
};