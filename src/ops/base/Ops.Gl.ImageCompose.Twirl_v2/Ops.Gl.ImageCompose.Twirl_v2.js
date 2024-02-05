let render = op.inTrigger("Render");
let amount = op.inValue("Amount");
let radius = op.inValue("Radius");
let centerX = op.inValue("Center X", 0.5);
let centerY = op.inValue("Center Y", 0.5);
let trigger = op.outTrigger("Next");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);
shader.setSource(shader.getDefaultVertexShader(), attachments.twirl_frag);

let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let uniamount = new CGL.Uniform(shader, "f", "amount", 0);
let uniRadius = new CGL.Uniform(shader, "f", "radius", radius);
let unicenterX = new CGL.Uniform(shader, "f", "centerX", centerX);
let unicenterY = new CGL.Uniform(shader, "f", "centerY", centerY);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    let texture = cgl.currentTextureEffect.getCurrentSourceTexture();

    uniamount.setValue(amount.get() * (1 / texture.width));

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
