const
    exec = op.inTrigger("Trigger"),
    inPosX = op.inFloat("Position X"),
    inPosY = op.inFloat("Position Y"),
    inPosZ = op.inFloat("Position Z"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);

let light = null;

inPosX.onChange =
inPosY.onChange =
inPosZ.onChange = () =>
{
    if (light)
        light.position.set(inPosX.get(), inPosY.get(), inPosZ.get());
};

exec.onTriggered = () =>
{
    if (!light)
    {
        light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(0, 0, 0);

        threeOp.setSceneObject(light);
    }

    threeOp.trigger();

    next.trigger();
};
