const
    exec = op.inTrigger("Trigger"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1),
    next = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });
let oldDiffuseCol = null;

exec.onTriggered = () =>
{
    const cgl = op.patch.cgl;
    const shader = cgl.getShader();
    const active = shader && shader.materialPropUniforms && shader.materialPropUniforms.diffuseColor;

    if (active)
    {
        oldDiffuseCol = shader.materialPropUniforms.diffuseColor.getValue();

        shader.materialPropUniforms.diffuseColor.set([r.get(), g.get(), b.get(), a.get()]);
    }

    next.trigger();

    if (active)
    {
        shader.materialPropUniforms.diffuseColor.set(oldDiffuseCol);
    }

};
