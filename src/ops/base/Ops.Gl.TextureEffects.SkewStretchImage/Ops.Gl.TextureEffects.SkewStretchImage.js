const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    // inSmooth=op.inBool("Smoothstep",false),
    inClamp = op.inBool("Clamp", false),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "skewstrechimage");
shader.setSource(shader.getDefaultVertexShader(), attachments.invert_frag);

const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

shader.addUniformFrag("f", "stretchTopX", op.inFloat("Stretch Top", 1));
shader.addUniformFrag("f", "stretchBotX", op.inFloat("Stretch Bottom", 1));
shader.addUniformFrag("f", "stretchLeft", op.inFloat("Stretch Left", 1));
shader.addUniformFrag("f", "stretchRight", op.inFloat("Stretch Right", 1));

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

inClamp.onChange = function ()
{
    shader.toggleDefine("CLAMP", inClamp.get());
};

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
