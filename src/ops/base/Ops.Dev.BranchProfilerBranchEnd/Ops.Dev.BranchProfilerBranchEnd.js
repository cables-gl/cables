const
    inExec = op.inTrigger("Exec"),
    outNext = op.outTrigger("Next");

op.patch.cgl.frameStore.branchProfiler = op.patch.cgl.frameStore.branchProfiler || {};

inExec.onTriggered = ()=>
{
    if(op.patch.cgl.frameStore.branchStack) op.patch.cgl.frameStore.branchStack.pop();
    outNext.trigger();
};
