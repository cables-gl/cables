const
    inExec = op.inTrigger("Exec"),
    outNext = op.outTrigger("Next");

op.patch.cgl.tempData.branchProfiler = op.patch.cgl.tempData.branchProfiler || {};

inExec.onTriggered = () =>
{
    if (op.patch.cgl.tempData.branchStack) op.patch.cgl.tempData.branchStack.pop();
    outNext.trigger();
};
