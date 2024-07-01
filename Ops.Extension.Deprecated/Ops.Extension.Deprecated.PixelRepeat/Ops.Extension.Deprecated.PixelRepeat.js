op.name = "PixelRepeat";

let render = op.inTrigger("render");

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, "pixelrepeat");

shader.setSource(shader.getDefaultVertexShader(), attachments.pixelrepeat_frag);

let uniMask = new CGL.Uniform(shader, "t", "mask", 1);
let unTex = new CGL.Uniform(shader, "t", "tex", 0);

let time = op.inValue("Time");
let uniTime = new CGL.Uniform(shader, "f", "time", time);

let mask = op.addInPort(new CABLES.Port(op, "mask", CABLES.OP_PORT_TYPE_TEXTURE, { "preview": true }));

let prim = op.inValueSelect("Primitive", ["Rectangle", "Circle"], "Rectangle");

render.onTriggered = function ()
{
    if (!mask.get()) return;
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.setTexture(1, mask.get().tex);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, mask.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
