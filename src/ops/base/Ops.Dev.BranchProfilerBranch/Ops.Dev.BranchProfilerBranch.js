const
    inExec = op.inTrigger("Exec"),
    inName = op.inString("Branch Name", "default"),
    outNext = op.outTrigger("Next");

op.patch.cgl.frameStore.branchProfiler = op.patch.cgl.frameStore.branchProfiler || {};

inExec.onTriggered = () =>
{
    op.patch.cgl.frameStore.branchStack = op.patch.cgl.frameStore.branchStack || new CABLES.BranchStack();

    const c = op.patch.cgl.frameStore.branchStack.push(inName.get());

    outNext.trigger();

    if (op.patch.cgl.frameStore.branchStack.current == c) op.patch.cgl.frameStore.branchStack.pop();
};
