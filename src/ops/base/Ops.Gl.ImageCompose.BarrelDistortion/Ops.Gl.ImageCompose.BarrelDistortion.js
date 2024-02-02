let render = op.inTrigger("render");
let amount = op.inValue("amount");

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.barreldistort_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let uniamount = new CGL.Uniform(shader, "f", "amount", 0);

render.onTriggered = function ()
{
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
