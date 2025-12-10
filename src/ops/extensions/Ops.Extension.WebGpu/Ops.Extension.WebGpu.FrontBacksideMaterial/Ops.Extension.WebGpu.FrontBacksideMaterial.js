const
    inTrigger = op.inTrigger("Render"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1),
    r2 = op.inValueSlider("r 2", Math.random()),
    g2 = op.inValueSlider("g 2", Math.random()),
    b2 = op.inValueSlider("b 2", Math.random()),
    a2 = op.inValueSlider("a 2", 1),
    next = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });
r2.setUiAttribs({ "colorPick": true });

let shader = null;

inTrigger.onTriggered = () =>
{
    const cgp = op.patch.cg;
    if (!shader)
    {
        shader = new CGP.Shader(cgp, op.name);
        shader.setSource(attachments.lambert_wgsl);
        shader.addUniform(new CGP.Uniform(shader, "4f", "color", r, g, b, a), GPUShaderStage.FRAGMENT);
        shader.addUniform(new CGP.Uniform(shader, "4f", "backColor", r2, g2, b2, a2), GPUShaderStage.FRAGMENT);
    }

    cgp.pushShader(shader);

    next.trigger();

    cgp.popShader();
};
