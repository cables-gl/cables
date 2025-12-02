const
    exec = op.inTrigger("Trigger"),
    inPosX = op.inFloat("Position X"),
    inPosY = op.inFloat("Position Y"),
    inPosZ = op.inFloat("Position Z"),
    inScale = op.inFloat("Scale", 1),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);

let obj = null;

exec.onTriggered = () =>
{
    if (!obj)
    {
        obj = new THREE.Object3D();
        threeOp.setSceneObject(obj);
    }

    obj.position.set(inPosX.get(), inPosY.get(), inPosZ.get());
    obj.scale.x = obj.scale.y = obj.scale.z = inScale.get();

    threeOp.push();

    next.trigger();

    threeOp.pop();
};
