let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let inLut = op.inTexture("LUT Image");

let inAmount = op.inValueSlider("Amount", 1.0);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name);


shader.setSource(shader.getDefaultVertexShader(), attachments.lut_frag);
var textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

var textureUniform = new CGL.Uniform(shader, "t", "texLut", 1);
let uniPos = new CGL.Uniform(shader, "f", "amount", inAmount);


render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!inLut.get()) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);


    cgl.setTexture(1, inLut.get().tex);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inLut.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
