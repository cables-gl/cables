const
    inExec = op.inTrigger("Update"),
    outUsed = op.outNumber("Used Heap Size", 0),
    outTotal = op.outNumber("Total Heap Size", 0);

if (performance.memory && performance.memory.usedJSHeapSize)
    inExec.onTriggered = update;

function update()
{
    outUsed.set(performance.memory.usedJSHeapSize / 1024 / 1024);
    outTotal.set(performance.memory.totalJSHeapSize / 1024 / 1024);
}
