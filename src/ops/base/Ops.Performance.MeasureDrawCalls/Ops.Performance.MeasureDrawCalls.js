const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next"),
    myNumber = op.outNumber("Total drawcalls");

let count = 0;
let lastUpdateTitle = 0;

function updateTitle()
{
    op.setUiAttrib({ "extendTitle": count + "x" });
    lastUpdateTitle = performance.now();
}

exec.onTriggered = () =>
{
    const beforeCount = op.patch.cgl.perfProfiler.getCount(op.patch.cgl.name + "meshDrawCalls");
    next.trigger();

    const afterCount = op.patch.cgl.perfProfiler.getCount(op.patch.cgl.name + "meshDrawCalls");

    count = afterCount - beforeCount;
    myNumber.set(count);
    if (performance.now() - lastUpdateTitle > 300) updateTitle();

};
