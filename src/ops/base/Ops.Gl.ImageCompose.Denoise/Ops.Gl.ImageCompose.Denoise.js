let render = op.inTrigger("render");
let strength = op.inValueSlider("Exponent", 0.6);

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);
let tsize = [128, 128];
let srcFrag = attachments.denoise_frag;

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

let strengthUniform = new CGL.Uniform(shader, "f", "exponent", strength);
let texSizeUniform = new CGL.Uniform(shader, "2f", "texSize", tsize);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    tsize[0] = cgl.currentTextureEffect.getCurrentSourceTexture().width;
    tsize[1] = cgl.currentTextureEffect.getCurrentSourceTexture().height;
    texSizeUniform.setValue(tsize);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
