const
    inExec = op.inTrigger("Exec"),
    inName = op.inString("Branch Name", "default"),
    outNext = op.outTrigger("Next"),
    outDur = op.outNumber("Duration");

inExec.onTriggered = () =>
{
    op.patch.cg.frameStore.branchProfiler = op.patch.cg.frameStore.branchProfiler || {};

    op.patch.cg.frameStore.branchStack = op.patch.cg.frameStore.branchStack || new CABLES.BranchStack();

    const c = op.patch.cg.frameStore.branchStack.push(inName.get());

    outNext.trigger();

    // if (op.patch.cg.frameStore.branchStack.current == c)
    op.patch.cg.frameStore.branchStack.pop();

    outDur.set(c.dur);
};
