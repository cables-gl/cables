const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    sides = op.inValue("Sides", 10),
    angle = op.inValueSlider("Angle", 0),
    slidex = op.inValueSlider("Slide X", 0),
    slidey = op.inValueSlider("Slide Y", 0),
    centerX = op.inValueSlider("Center X", 0.5),
    centerY = op.inValueSlider("Center Y", 0.5),
    inAspect = op.inBool("Aspect Ratio", true),
    trigger = op.outTrigger("Next");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

const
    unisides = new CGL.Uniform(shader, "f", "sides", sides),
    uniangle = new CGL.Uniform(shader, "f", "angle", angle),
    unislidex = new CGL.Uniform(shader, "f", "slidex", slidex),
    unislidey = new CGL.Uniform(shader, "f", "slidey", slidey),
    uniCenterX = new CGL.Uniform(shader, "f", "centerX", centerX),
    uniCenterY = new CGL.Uniform(shader, "f", "centerY", centerY),
    uniAmount = new CGL.Uniform(shader, "f", "amount", amount),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", 1);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

shader.setSource(shader.getDefaultVertexShader(), attachments.kaleidoscope_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    if (inAspect.get()) uniAspect.setValue(cgl.currentTextureEffect.aspectRatio);
    else uniAspect.setValue(1);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
