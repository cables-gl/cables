let render = op.inTrigger("render");
let radius = op.inValueSlider("radius", 0.25);
let r = op.inValueSlider("r");
let g = op.inValueSlider("g");
let b = op.inValueSlider("b");
let next = op.outTrigger("next");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name);
shader.setSource(shader.getDefaultVertexShader(), attachments.roundcorners_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
radius.uniform = new CGL.Uniform(shader, "f", "radius", radius);
r.uniform = new CGL.Uniform(shader, "f", "r", r);
g.uniform = new CGL.Uniform(shader, "f", "g", g);
b.uniform = new CGL.Uniform(shader, "f", "b", b);

let uniWidth = new CGL.Uniform(shader, "f", "width", 512);
let uniHeight = new CGL.Uniform(shader, "f", "height", 512);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    let texture = cgl.currentTextureEffect.getCurrentSourceTexture();

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    next.trigger();
};
