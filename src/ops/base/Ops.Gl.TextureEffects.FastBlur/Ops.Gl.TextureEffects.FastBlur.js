const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    amount = op.inFloat("amount", 3),
    clamp = op.inBool("Clamp", false),
    maskInvert = op.inBool("Mask Invert", false),
    mask = op.inTexture("Mask");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "fastblur");

shader.setSource(attachments.blur_vert, attachments.blur_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniDirX = new CGL.Uniform(shader, "f", "dirX", 0),
    uniDirY = new CGL.Uniform(shader, "f", "dirY", 0),
    uniWidth = new CGL.Uniform(shader, "f", "width", 0),
    uniHeight = new CGL.Uniform(shader, "f", "height", 0),
    uniPass = new CGL.Uniform(shader, "f", "pass", 0),
    uniAmount = new CGL.Uniform(shader, "f", "amount", amount.get()),
    textureAlpha = new CGL.Uniform(shader, "t", "texMask", 1);

amount.onChange = () => { uniAmount.setValue(amount.get()); };

const direction = op.inDropDown("direction", ["both", "vertical", "horizontal"]);
let dir = 0;
direction.set("both");
direction.onChange = () =>
{
    if (direction.get() == "both")dir = 0;
    if (direction.get() == "horizontal")dir = 1;
    if (direction.get() == "vertical")dir = 2;
};

clamp.onChange = () => { shader.toggleDefine("CLAMP", clamp.get()); };

maskInvert.onChange =
mask.onChange = () =>
{
    shader.toggleDefine("USE_MASK", mask.isLinked());
    shader.toggleDefine("MASK_INVERT", maskInvert.get());
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);
    const numPasses = amount.get();

    if (mask.get())cgl.setTexture(1, mask.get().tex);

    for (let i = 0; i < numPasses; i++)
    {
        cgl.pushShader(shader);

        uniPass.setValue(i / numPasses);

        // first pass
        if (dir === 0 || dir == 2)
        {
            cgl.currentTextureEffect.bind();
            cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

            uniDirX.setValue(0.0);
            uniDirY.setValue(1.0 + (i * i));

            cgl.currentTextureEffect.finish();
        }

        // second pass
        if (dir === 0 || dir == 1)
        {
            cgl.currentTextureEffect.bind();
            cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

            uniDirX.setValue(1.0 + (i * i));
            uniDirY.setValue(0.0);

            cgl.currentTextureEffect.finish();
        }

        cgl.popShader();
    }

    trigger.trigger();
};
