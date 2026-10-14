const
    render = op.inTrigger("render"),
    scale = op.inFloat("scale", 1.0),
    scaleX = op.inFloat("x", 1),
    scaleY = op.inFloat("y", 1),
    scaleZ = op.inFloat("z", 1),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Axis", [scaleX, scaleY, scaleZ]);

const vScale = vec3.create();

scaleX.onChange =
    scaleY.onChange =
    scaleZ.onChange =
    scale.onChange = scaleChanged;

scaleChanged();

render.onTriggered = function ()
{
    const cgl = op.patch.cg || op.patch.cgl;
    cgl.pushModelMatrix();
    mat4.scale(cgl.mMatrix, cgl.mMatrix, vScale);
    trigger.trigger();
    cgl.popModelMatrix();
};

function scaleChanged()
{
    const s = scale.get();
    vec3.set(vScale, s * scaleX.get(), s * scaleY.get(), s * scaleZ.get());
}
