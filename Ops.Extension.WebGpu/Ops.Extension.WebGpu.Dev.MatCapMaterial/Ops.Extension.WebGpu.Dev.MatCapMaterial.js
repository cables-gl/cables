const
    inTrigger = op.inTrigger("Render"),
    r = op.inValueSlider("r", 1),
    g = op.inValueSlider("g", 1),
    b = op.inValueSlider("b", 1),
    a = op.inValueSlider("a", 1),

    colorizeTexture = op.inBool("Colorize Texture", false),
    diffuseRepeatX = op.inValue("diffuseRepeatX", 1),
    diffuseRepeatY = op.inValue("diffuseRepeatY", 1),
    diffuseOffsetX = op.inValue("Tex Offset X", 0),
    diffuseOffsetY = op.inValue("Tex Offset Y", 0),

    inTex = op.inTexture("Matcap"),
    inTextureDiffuse = op.inTexture("Diffuse"),
    next = op.outTrigger("Next");

new CABLES.WebGpuOp(op);

r.setUiAttribs({ "colorPick": true });

let shader = null;

colorizeTexture.onChange = updateDefines;

inTextureDiffuse.onLinkChanged =
inTex.onChange = // really rebuild whole pipeline when texture changed? change only bindgroup?
inTex.onLinkChanged = () =>
{
    shader = null;
};

inTrigger.onTriggered = () =>
{
    const cgp = op.patch.cg;
    if (!shader)
    {
        shader = new CGP.Shader(cgp, op.name);
        shader.setSource(attachments.mat_wgsl);
        shader.addUniformFrag("4f", "color", r, g, b, a);
        shader.addUniformFrag("4f", "texTransform", diffuseRepeatX, diffuseRepeatY, diffuseOffsetX, diffuseOffsetY);

        const binTex = new CGP.Binding(cgp, "tex", { "shader": shader, "stage": "frag" });
        binTex.addUniform(new CGP.Uniform(shader, "t", "ourTexture", inTex));

        const binTexDiff = new CGP.Binding(cgp, "tex", { "shader": shader, "stage": "frag" });
        binTexDiff.addUniform(new CGP.Uniform(shader, "t", "texDiffuse", inTextureDiffuse));

        const binSampler = new CGP.Binding(cgp, "sampler", { "shader": shader, "stage": "frag" });
        binSampler.addUniform(new CGP.Uniform(shader, "sampler", "ourSampler"));

        console.log(binSampler.getBindingGroupLayoutEntry());

        updateDefines();
    }

    cgp.pushShader(shader);

    next.trigger();

    cgp.popShader();
};

function updateDefines()
{
    if (!shader) return;
    shader.toggleDefine("COLORIZE_TEXTURE", colorizeTexture.get());
    shader.toggleDefine("HAS_TEXTURE", inTex.isLinked());
    shader.toggleDefine("HAS_TEXTURE_DIFFUSE", inTextureDiffuse.isLinked());
}
