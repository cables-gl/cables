const
    exec = op.inTrigger("Trigger"),
    o1 = op.inArray("Objects A"),
    o2 = op.inArray("Objects B"),
    myNumber = op.inFloat("Number"),

    inAnchor1x = op.inFloat("Anchor1 X"),
    inAnchor1y = op.inFloat("Anchor1 Y"),
    inAnchor1z = op.inFloat("Anchor1 Z"),

    inAnchor2x = op.inFloat("Anchor2 X"),
    inAnchor2y = op.inFloat("Anchor2 Y"),
    inAnchor2z = op.inFloat("Anchor2 Z"),

    inAxisx = op.inFloat("Axis X"),
    inAxisy = op.inFloat("Axis Y"),
    inAxisz = op.inFloat("Axis Z"),

    next = op.outTrigger("Next");

op.toWorkPortsNeedToBeLinked(exec, o1, o2);
let lastworld = null;
let needsSetup = true;
const joints = [];

inAnchor1x.onChange =
    inAnchor1y.onChange =
    inAnchor1z.onChange =
    inAnchor2x.onChange =
    inAnchor2y.onChange =
    inAnchor2z.onChange =
    inAxisx.onChange =
    inAxisy.onChange =
    inAxisz.onChange =
    o1.onChange =
    o2.onChange = () =>
    {
        needsSetup = true;
    };

op.onDelete = remove;

function remove()
{
    if (!lastworld) return;

    if (joints.length > 0)
    {
        for (let i = 0; i < joints.length; i++)
        {
            lastworld.removeImpulseJoint(joints[i]);
        }
        joints.length = 0;
    }
}

function setup()
{
    const arr1 = o1.get();
    const arr2 = o2.get();
    const world = op.patch.frameStore.rapier.world;
    const r1 = [];
    const r2 = [];

    if (!arr1 || !arr2 || !world || arr1.length < 1 || arr2.length < 1) return;

    remove();
    for (let i = 0; i < Math.min(arr1.length, arr2.length); i++)
    {
        let params = RAPIER.JointData.revolute(
            { "x": inAnchor1x.get(), "y": inAnchor1y.get(), "z": inAnchor1z.get() },
            { "x": inAnchor2x.get(), "y": inAnchor2y.get(), "z": inAnchor2z.get() },
            { "x": inAxisx.get(), "y": inAxisy.get(), "z": inAxisz.get() });
        let joint = world.createImpulseJoint(params, arr1[i], arr2[i], true);
        joints.push(joint);
    }
    needsSetup = false;
    lastworld = world;
}

exec.onTriggered = () =>
{
    if (needsSetup)setup();
};
