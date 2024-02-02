const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    scale = op.inValue("Scale", 4),
    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),
    z = op.inValue("Z", 0);

let trigger = op.outTrigger("trigger");

op.setPortGroup("Position", [x, y, z]);
op.setPortGroup("Look", [scale]);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.valuenoise3d_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

let uniZ = new CGL.Uniform(shader, "f", "z", z);
let uniX = new CGL.Uniform(shader, "f", "x", x);
let uniY = new CGL.Uniform(shader, "f", "y", y);
let uniScale = new CGL.Uniform(shader, "f", "scale", scale);

let amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

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
