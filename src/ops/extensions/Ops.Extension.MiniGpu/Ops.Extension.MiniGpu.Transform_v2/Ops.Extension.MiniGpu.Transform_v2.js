const
    exec = op.inTrigger("Trigger"),
    transX = op.inFloat("Translate X", 0),
    transY = op.inFloat("Translate Y", 0),
    transZ = op.inFloat("Translate Z", 0),
    scale = op.inFloat("Scale", 1),
    scaleX = op.inFloat("Scale X", 1),
    scaleY = op.inFloat("Scale Y", 1),
    scaleZ = op.inFloat("Scale Z", 1),
    rotationX = op.inFloat("Rotation X", 0),
    rotationY = op.inFloat("Rotation Y", 0),
    rotationZ = op.inFloat("Rotation Z", 0),
    next = op.outTrigger("Next");

let mat = MGPU.mm.identity();
let changed = true;

scale.onChange =
    scaleX.onChange =
    scaleY.onChange =
    scaleZ.onChange =
    rotationX.onChange =
    rotationY.onChange =
    rotationZ.onChange =
    transX.onChange =
    transY.onChange =
    transZ.onChange = () =>
    {
        changed = true;
    };

exec.onTriggered = () =>
{
    if (changed)
    {
        mat = MGPU.mm.identity();
        mat = MGPU.mm.translate(mat, transX.get(), transY.get(), transZ.get());
        const scl = scale.get();
        mat = MGPU.mm.scale(mat, scaleX.get() * scl, scaleY.get() * scl, scaleZ.get() * scl);

        mat = MGPU.mm.rotate(mat, [1, 0, 0], rotationX.get() / MGPU.mm.RAD2DEG);
        mat = MGPU.mm.rotate(mat, [0, 1, 0], rotationY.get() / MGPU.mm.RAD2DEG);
        mat = MGPU.mm.rotate(mat, [0, 0, 1], rotationZ.get() / MGPU.mm.RAD2DEG);

        changed = false;
    }

    op.patch.frameStore.mgpu.matModel.push(
        MGPU.mm.mul(op.patch.frameStore.mgpu.matModel.current(), mat));

    next.trigger();
    op.patch.frameStore.mgpu.matModel.pop();
};
