const
    render = op.inTrigger("render"),
    hue = op.inValueSlider("hue", 1),
    texMask = op.inTexture("Mask"),
    texOffset = op.inTexture("Offset"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.hue_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

const textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1);
const textureOffsetUniform = new CGL.Uniform(shader, "t", "texOffset", 2);

const uniformHue = new CGL.Uniform(shader, "f", "hue", 1.0);

hue.onChange = function () { uniformHue.setValue(hue.get()); };

texMask.onChange =
texOffset.onChange = () =>
{
    shader.toggleDefine("TEX_MASK", texMask.get());
    shader.toggleDefine("TEX_OFFSET", texOffset.get());
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    if (texMask.get()) cgl.setTexture(1, texMask.get().tex);
    if (texOffset.get()) cgl.setTexture(2, texOffset.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
