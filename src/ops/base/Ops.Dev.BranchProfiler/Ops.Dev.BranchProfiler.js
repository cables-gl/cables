const
    inExec = op.inTrigger("Exec"),
    outNext = op.outTrigger("Next"),
    outTimes = op.outArray("Branch Times"),
    outNames = op.outArray("Branch Names"),
    outProfilerStack =op.outObject("Profiler Data"),
    outTotalMs=op.outNumber("Total Ms");

op.patch.cgl.frameStore.branchProfiler = op.patch.cgl.frameStore.branchProfiler || {};

inExec.onTriggered = () =>
{
    op.patch.cgl.frameStore.branchProfiler={};

    op.patch.cgl.frameStore.branchStack=op.patch.cgl.frameStore.branchStack||new CABLES.BranchStack();

    op.patch.cgl.frameStore.branchStack.start();

    let startTime = performance.now();
    outNext.trigger();

    op.patch.cgl.frameStore.branchStack.finish();

    const arrTimes = [];
    const arrNames = [];
    let count = 0;
    let total=0;

    // for (let i in op.patch.cgl.frameStore.branchProfiler)
    // {
    //     arrTimes[count] = op.patch.cgl.frameStore.branchProfiler[i];
    //     arrNames[count] = i;
    //     total+=arrTimes[count];

    //     count++;
    // }

    outTotalMs.set(total);

    outProfilerStack.set(op.patch.cgl.frameStore.branchStack);

    outNames.set(arrNames);
    outTimes.set(arrTimes);

};
