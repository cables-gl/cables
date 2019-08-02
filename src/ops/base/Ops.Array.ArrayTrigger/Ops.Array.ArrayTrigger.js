const
    inExec=op.inTriggerButton("Exec"),
    inArr=op.inArray("Array"),
    outTrigger=op.outTrigger("Trigger out"),
    result=op.outArray("Result");

inExec.onTriggered=function()
{
    const arrValue = inArr.get();
    if(!arrValue) result.set(null);
    result.set(inArr.get());
    outTrigger.trigger();
};