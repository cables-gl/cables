const
    exec = op.inTrigger("Trigger"),
    inColl1 = op.inArray("Colliders 1"),
    inColl2 = op.inArray("Colliders 2"),
    outHasColl = op.outBoolNum("Has Collision"),
    outColl1 = op.outArray("Collisions 1"),
    outColl2 = op.outArray("Collisions 2");

op.toWorkPortsNeedToBeLinked(inColl1, inColl2);

exec.onTriggered = () =>
{
    const arr1 = inColl1.get();
    const arr2 = inColl2.get();
    const world = op.patch.frameStore.rapierWorld;
    const r1 = [];
    const r2 = [];

    if (!arr1 || !arr2 || !world)
        return outHasColl.set(false);

    outHasColl.set(false);
    const events = op.patch.frameStore.rapierCollisionEvents;

    for (let i = 0; i < arr1.length; i++)
        r1[i] = 0;

    for (let j = 0; j < arr2.length; j++)
        r2[j] = 0;

    for (let i = 0; i < arr1.length; i++)
    {
        // console.log("arr1[i].handle",arr1[i].handle);
        for (let j = 0; j < arr2.length; j++)
        {
            if (arr1[i] != arr2[j])

                for (let e in events)//= 0; e < events.length; e++)
                {
                    if ((
                        arr1[i].handle == events[e].handle1 &&
                    arr2[j].handle == events[e].handle2

                    )
                || (
                    arr2[j].handle == events[e].handle1 &&
                    arr1[i].handle == events[e].handle2)
                    )
                    {
                        outHasColl.set(true);
                        r1[i] = 1;
                        r2[j] = 1;
                    }
                }
        }
    }

    // for (let i = 0; i < arr1.length; i++)
    // {
    //     for (let j = 0; j < arr2.length; j++)
    //     {
    //         if (arr1[i] == arr2[j]) continue;

    //         world.contactPair(arr1[i], arr2[j], (manifold, flipped) =>
    //         {
    //             outHasColl.set(true);
    //             r1[i] = 1;
    //             r2[j] = 1;
    //         });
    //     }
    // }

    outColl1.setRef(r1);
    outColl2.setRef(r2);
};
