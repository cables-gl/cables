const
    exec = op.inTrigger("update"),
    inName0 = op.inString("Name 1", ""),
    inName1 = op.inString("Name 2", ""),
    next = op.outTrigger("Next"),
    outColliding = op.outBoolNum("Colliding");

let oldWorld = null;

exec.onTriggered = () =>
{
    const ammoWorld = op.patch.cgl.frameStore.ammoWorld;
    if (!ammoWorld) return;

    if (oldWorld != ammoWorld)
    {
        oldWorld = ammoWorld;
    }

    const name0 = inName0.get();
    const name1 = inName1.get();

    const allCols = ammoWorld.getCollisions();
    const cols = allCols.find((col) => { return (col.name0 === name0 && col.name1 === name1) || (col.name0 === name1 && col.name1 === name0); });

    outColliding.set(!!cols);

    next.trigger();
};
