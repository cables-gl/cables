let render = op.inTrigger("Render");
let blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal");
let amount = op.inFloatSlider("Amount", 1);

let sides = op.inFloat("Sides", 10);
let angle = op.inFloatSlider("Angle", 0);
let slidex = op.inFloatSlider("Slide X", 0);
let slidey = op.inFloatSlider("Slide Y", 0);
let centerX = op.inFloatSlider("Center X", 0.5);
let centerY = op.inFloatSlider("Center Y", 0.5);

let trigger = op.addOutPort(new CABLES.Port(op, "Next", CABLES.Port.TYPE_FUNCTION));

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

let unisides = new CGL.Uniform(shader, "f", "sides", sides);
let uniangle = new CGL.Uniform(shader, "f", "angle", angle);
let unislidex = new CGL.Uniform(shader, "f", "slidex", slidex);
let unislidey = new CGL.Uniform(shader, "f", "slidey", slidey);
let uniCenterX = new CGL.Uniform(shader, "f", "centerX", centerX);
let uniCenterY = new CGL.Uniform(shader, "f", "centerY", centerY);
let uniAmount = new CGL.Uniform(shader, "f", "amount", amount);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

shader.setSource(shader.getDefaultVertexShader(), attachments.kaleidoscope_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

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
