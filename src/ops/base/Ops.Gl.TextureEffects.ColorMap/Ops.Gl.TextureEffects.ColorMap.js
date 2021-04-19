let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let inGradient = op.inTexture("Gradient");

let inPos = op.inValueSlider("Position", 0.5);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name);


shader.setSource(shader.getDefaultVertexShader(), attachments.colormap_frag);
var textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

var textureUniform = new CGL.Uniform(shader, "t", "gradient", 1);
let uniPos = new CGL.Uniform(shader, "f", "pos", inPos);


render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!inGradient.get()) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);


    cgl.setTexture(1, inGradient.get().tex);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inGradient.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
