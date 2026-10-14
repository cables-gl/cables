const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    x = op.inFloat("x"),
    y = op.inFloat("y"),
    z = op.inFloat("z");

const vec = vec3.create();
op.setUiAxisPorts(x, y, z);

render.onTriggered = function ()
{
    const cgl = op.patch.cg || op.patch.cgl;

    vec3.set(vec, x.get(), y.get(), z.get());
    cgl.pushModelMatrix();
    mat4.translate(cgl.mMatrix, cgl.mMatrix, vec);
    trigger.trigger();
    cgl.popModelMatrix();
};
