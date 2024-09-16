const
    inExec = op.inTrigger("Exec"),
    outNext = op.outTrigger("Next"),
    outProfilerStack = op.outObject("Profiler Data");

inExec.onTriggered = () =>
{
    op.patch.cg.frameStore.branchProfiler = op.patch.cg.frameStore.branchProfiler || {};

    op.patch.cg.frameStore.branchProfiler = {};

    op.patch.cg.frameStore.branchStack = op.patch.cg.frameStore.branchStack || new CABLES.BranchStack();

    op.patch.cg.frameStore.branchStack.start();

    outNext.trigger();

    op.patch.cg.frameStore.branchStack.finish();

    outProfilerStack.set(op.patch.cg.frameStore.branchStack);
};
