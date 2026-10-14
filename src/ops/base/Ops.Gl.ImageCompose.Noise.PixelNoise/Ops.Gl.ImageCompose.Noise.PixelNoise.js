const render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inFloatSlider("Amount", 1),
    numX = op.inFloat("Num X", 10),
    numY = op.inFloat("Num Y", 10),
    addX = op.inFloat("X", 0),
    addY = op.inFloat("Y", 0),
    addZ = op.inFloat("Z", 0),
    inRGB = op.inBool("RGB", false);

const trigger = op.outTrigger("Next");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);
const timeUniform = new CGL.Uniform(shader, "f", "time", 1.0);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

shader.setSource(shader.getDefaultVertexShader(), attachments.pixelnoise_frag);

numX.uniform == new CGL.Uniform(shader, "f", "numX", numX);
numY.uniform == new CGL.Uniform(shader, "f", "numY", numY);
addX.uniform == new CGL.Uniform(shader, "f", "addX", addX);
addY.uniform == new CGL.Uniform(shader, "f", "addY", addY);
addZ.uniform == new CGL.Uniform(shader, "f", "addZ", addZ);

inRGB.onChange = function ()
{
    if (inRGB.get())shader.define("RGB");
    else shader.removeDefine("RGB");
};

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

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
