const
    render = op.inTrigger("render"),
    radius = op.inValueSlider("radius", 0.25),
    r = op.inValueSlider("r"),
    g = op.inValueSlider("g"),
    b = op.inValueSlider("b"),
    a = op.inValueSlider("a", 1),
    next = op.outTrigger("next");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);
shader.setSource(shader.getDefaultVertexShader(), attachments.roundcorners_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
radius.uniform = new CGL.Uniform(shader, "f", "radius", radius);
r.uniform = new CGL.Uniform(shader, "f", "r", r);
g.uniform = new CGL.Uniform(shader, "f", "g", g);
b.uniform = new CGL.Uniform(shader, "f", "b", b);
a.uniform = new CGL.Uniform(shader, "f", "a", a);
r.setUiAttribs({ "colorPick": true });

let uniWidth = new CGL.Uniform(shader, "f", "width", 512);
let uniHeight = new CGL.Uniform(shader, "f", "height", 512);
let uniAspect = new CGL.Uniform(shader, "f", "aspect", 1);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    let texture = cgl.currentTextureEffect.getCurrentSourceTexture();

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    next.trigger();
};
