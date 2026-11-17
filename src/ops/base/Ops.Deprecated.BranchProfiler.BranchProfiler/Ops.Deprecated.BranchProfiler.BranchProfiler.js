const
    inExec = op.inTrigger("Exec"),
    outNext = op.outTrigger("Next"),
    outFinish = op.outTrigger("Finished"),
    outProfilerStack = op.outObject("Profiler Data"),
    outDur = op.outNumber("Duration");

inExec.onTriggered = () =>
{

    op.patch.cg.frameStore.branchProfiler = {};

    op.patch.cg.frameStore.branchStack = op.patch.cg.frameStore.branchStack || new CABLES.BranchStack();

    op.patch.cg.frameStore.branchStack.start();

    const starttime = performance.now();
    outNext.trigger();
    const dur = performance.now() - starttime;
    outDur.set(dur);

    op.patch.cg.frameStore.branchStack.finish();

    outProfilerStack.setRef(op.patch.cg.frameStore.branchStack);
    outFinish.trigger();
};
