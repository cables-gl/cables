const
    inTrigger = op.inTrigger("Render"),
    r = op.inFloatSlider("r", Math.random()),
    g = op.inFloatSlider("g", Math.random()),
    b = op.inFloatSlider("b", Math.random()),
    a = op.inFloatSlider("a", 1),
    r2 = op.inFloatSlider("r 2", Math.random()),
    g2 = op.inFloatSlider("g 2", Math.random()),
    b2 = op.inFloatSlider("b 2", Math.random()),
    a2 = op.inFloatSlider("a 2", 1),
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
