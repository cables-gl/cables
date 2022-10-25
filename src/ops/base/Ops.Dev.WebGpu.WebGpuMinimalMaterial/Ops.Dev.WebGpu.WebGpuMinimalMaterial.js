const
    inTrigger = op.inTrigger("Render"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1),
    next = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });

let shader = null;

inTrigger.onTriggered = () =>
{
    const cgp = op.patch.cg;
    if (!shader)
    {
        shader = new CGP.Shader(cgp, op.name);
        shader.setSource(attachments.mat_wgsl);

        shader.addUniformFrag("4f", "color", r, g, b, a);
    }

    cgp.pushShader(shader);

    next.trigger();

    cgp.popShader(shader);
};
