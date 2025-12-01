const
    exec = op.inTrigger("Trigger"),
    inPosX = op.inFloat("Position X"),
    inPosY = op.inFloat("Position Y"),
    inPosZ = op.inFloat("Position Z"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);

const container = new THREE.Object3D();
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
        container.add(light);

        threeOp.setSceneObject(container);
    }

    threeOp.push();

    next.trigger();
    threeOp.pop();
};
