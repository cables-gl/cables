const
    render = op.inTrigger("Render"),
    inFade = op.inFloatSlider("Fade", 1),
    inMul = op.inFloat("Size", 1),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbmul_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniformMorph = new CGL.Uniform(shader, "f", "fade", inFade),
    uniformMul = new CGL.Uniform(shader, "f", "mul", inMul);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
