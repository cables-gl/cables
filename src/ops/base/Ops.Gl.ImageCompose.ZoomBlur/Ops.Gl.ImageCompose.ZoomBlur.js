let render = op.inTrigger("render");
let strength = op.inValueSlider("strength", 0.5);
let x = op.inValue("X", 0.5);
let y = op.inValue("Y", 0.5);

let mask = op.inTexture("mask");

mask.onChange = function ()
{
    if (mask.get() && mask.get().tex) shader.define("HAS_MASK");
    else shader.removeDefine("HAS_MASK");
};

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
var shader = new CGL.Shader(cgl, "zoomblur");

let srcFrag = attachments.zoomblur_frag;

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let textureMask = new CGL.Uniform(shader, "t", "texMask", 1);

let uniX = new CGL.Uniform(shader, "f", "x", x);
let uniY = new CGL.Uniform(shader, "f", "y", y);
let strengthUniform = new CGL.Uniform(shader, "f", "strength", strength);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    if (strength.get() > 0)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

        if (mask.get() && mask.get().tex)
        {
            cgl.setTexture(1, mask.get().tex);
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, mask.get().tex );
        }

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }
    trigger.trigger();
};
