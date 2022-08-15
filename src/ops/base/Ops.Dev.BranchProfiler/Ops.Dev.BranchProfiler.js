const
    inExec = op.inTrigger("Exec"),
    outNext = op.outTrigger("Next"),
    outProfilerStack = op.outObject("Profiler Data");

op.patch.cgl.frameStore.branchProfiler = op.patch.cgl.frameStore.branchProfiler || {};

inExec.onTriggered = () =>
{
    op.patch.cgl.frameStore.branchProfiler = {};

    op.patch.cgl.frameStore.branchStack = op.patch.cgl.frameStore.branchStack || new CABLES.BranchStack();

    op.patch.cgl.frameStore.branchStack.start();

    let startTime = performance.now();
    outNext.trigger();

    op.patch.cgl.frameStore.branchStack.finish();
    console.log(op.patch.cgl.frameStore.branchStack);
    outProfilerStack.set(op.patch.cgl.frameStore.branchStack);
};
