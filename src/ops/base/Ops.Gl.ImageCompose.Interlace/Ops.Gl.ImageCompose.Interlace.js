let render = op.inTrigger("render");
let amount = op.inFloatSlider("amount", 0.5);
let lum = op.inFloatSlider("Lumi Scale", 0.9);
let direction = op.inBool("X or Y", false);
let lineSize = op.inFloat("Line Size", 4);
let displace = op.inFloatSlider("Displacement", 0);

let add = op.inFloat("Add", 0.02);
let inScroll = op.inFloat("scroll", 0);

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.interlace_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let uniAmount = new CGL.Uniform(shader, "f", "amount", amount);

let uniLum = new CGL.Uniform(shader, "f", "lum", lum);
let uniLineSize = new CGL.Uniform(shader, "f", "lineSize", lineSize);
let uniAdd = new CGL.Uniform(shader, "f", "add", add);
let uniDisplace = new CGL.Uniform(shader, "f", "displace", displace);
let uniScroll = new CGL.Uniform(shader, "f", "scroll", inScroll);

direction.onChange = function ()
{
    shader.toggleDefine("DIRECTION", direction.get());
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
