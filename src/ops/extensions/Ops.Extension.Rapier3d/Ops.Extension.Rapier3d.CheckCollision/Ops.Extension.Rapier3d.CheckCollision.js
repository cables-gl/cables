const
    exec = op.inTrigger("Trigger"),
    inColl1 = op.inArray("Colliders 1"),
    outHasColl = op.outBoolNum("Has Collision"),
    outColl1 = op.outArray("Collisions 1");

op.toWorkPortsNeedToBeLinked(inColl1);

exec.onTriggered = () =>
{
    const arr1 = inColl1.get();
    const world = op.patch.frameStore.rapierWorld;
    const r1 = [];

    if (!arr1 || !world)
        return outHasColl.set(false);

    let hasCollision = false;
    const events = op.patch.frameStore.rapier.collisionEvents;

    for (let i = 0; i < arr1.length; i++)
    {
        r1[i] = 0;
        for (let e in events)
        {
            if (arr1[i].handle == events[e].handle1 || arr1[i].handle == events[e].handle2)
            {
                hasCollision = true;
                r1[i] = 1;
            }
        }
    }
    outHasColl.set(true);

    outColl1.setRef(r1);
};
