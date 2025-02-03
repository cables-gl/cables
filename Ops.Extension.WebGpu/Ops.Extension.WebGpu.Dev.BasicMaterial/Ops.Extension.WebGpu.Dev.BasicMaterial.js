const
    inTrigger = op.inTrigger("Render"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1),
    colorizeTexture = op.inBool("Colorize Texture", false),
    diffuseRepeatX = op.inValue("diffuseRepeatX", 1),
    diffuseRepeatY = op.inValue("diffuseRepeatY", 1),
    diffuseOffsetX = op.inValue("Tex Offset X", 0),
    diffuseOffsetY = op.inValue("Tex Offset Y", 0),

    inTex = op.inTexture("Texture"),
    inTexMask = op.inTexture("Mask"),
    next = op.outTrigger("Next");

new CABLES.WebGpuOp(op);

r.setUiAttribs({ "colorPick": true });

let shader = null;
let needDefines = true;

inTex.onChange =
    inTexMask.onLinkChanged =
    inTex.onLinkChanged =
    colorizeTexture.onChange = () =>
    {
        if (shader)shader.needsPipelineUpdate = "basicmat";
        needDefines = true;
        // shader=null;
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

        shader.setModules(["MODULE_COLOR"]);

        const binTex = new CGP.Binding(cgp, "tex", { "shader": shader, "stage": "frag", "define": "HAS_TEXTURE" });
        const uniTex = new CGP.Uniform(shader, "t", "ourTexture", inTex);
        binTex.addUniform(uniTex);

        const binSampler = new CGP.Binding(cgp, "sampler", { "stage": "frag", "shader": shader, "define": "HAS_TEXTURE" });
        binSampler.addUniform(new CGP.Uniform(shader, "sampler", "ourSampler", inTex));

        // const bindarr = new CGP.Binding(cgp, "arr", { "stage": "vert", "shader": shader, "bindingType": "read-only-storage" });
        // bindarr.addUniform(new CGP.Uniform(shader, "f[]", "arr", [
        //       0, 0.25, 0, 0,
        //     -0.5, 0, 0, 0,
        //      0.5, 0, 0, 0,]));

        const binTexMask = new CGP.Binding(cgp, "texMask", { "shader": shader, "stage": "frag", "define": "HAS_MASK_TEXTURE" });
        const uniTexMask = new CGP.Uniform(shader, "t", "ourTextureMask", inTexMask);
        binTexMask.addUniform(uniTexMask);

        needDefines = true;
    }

    if (needDefines && shader) updateDefines();

    cgp.pushShader(shader);

    next.trigger();

    cgp.popShader();
};

function updateDefines()
{
    if (!shader)
    {
        needDefines = true;
        return;
    }

    console.log("has texture", inTex.isLinked());
    shader.toggleDefine("COLORIZE_TEXTURE", colorizeTexture.get());
    shader.toggleDefine("HAS_TEXTURE", inTex.isLinked());
    shader.toggleDefine("HAS_MASK_TEXTURE", inTexMask.isLinked());

    needDefines = false;
}
