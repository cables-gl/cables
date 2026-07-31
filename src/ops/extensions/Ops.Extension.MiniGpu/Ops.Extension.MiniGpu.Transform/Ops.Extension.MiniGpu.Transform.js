const
    exec = op.inTrigger("Trigger"),
    transX = op.inFloat("Translate X"),
    transY = op.inFloat("Translate Y"),
    transZ = op.inFloat("Translate Z"),
    scale = op.inFloat("Scale", 1),
    scaleX = op.inFloat("Scale X", 1),
    scaleY = op.inFloat("Scale Y", 1),
    scaleZ = op.inFloat("Scale Z", 1),
    next = op.outTrigger("Next");

let mat = MGPU.mm.identity();
let changed = true;

scale.onChange =
    scaleX.onChange =
    scaleY.onChange =
    scaleZ.onChange =
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
        // console.log("mat", mat);
        changed = false;
    }

    op.patch.frameStore.mgpu.matModel.push(
        MGPU.mm.mul(op.patch.frameStore.mgpu.matModel.current(), mat));

    next.trigger();
    op.patch.frameStore.mgpu.matModel.pop();
};
