const
    exec = op.inTrigger("Trigger"),
    o1 = op.inArray("Objects A"),
    o2 = op.inArray("Objects B"),
    myNumber = op.inFloat("Number"),
    next = op.outTrigger("Next");

op.toWorkPortsNeedToBeLinked(exec, o1, o2);

exec.onTriggered = () =>
{
    const arr1 = o1.get();
    const arr2 = o2.get();
    const world = op.patch.frameStore.rapier.world;
    const r1 = [];
    const r2 = [];

    if (!arr1 || !arr2 || !world)
        return;

    let x = { "x": 1.0, "y": 0.0, "z": 0.0 };
    let params = RAPIER.JointData.revolute({ "x": 0.0, "y": 0.0, "z": 1.0 }, { "x": 0.0, "y": 0.0, "z": -3.0 }, x);
    let joint = world.createImpulseJoint(params, body1, body2, true);
};
