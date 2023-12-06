let render = op.inTrigger("render");

let inWidth = op.inValueFloat("Width");
let inHeight = op.inValueFloat("Height");
let inPosX = op.inValueFloat("X");
let inPosY = op.inValueFloat("Y");

const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
const a = op.inValueSlider("a", 1.0);
r.setUiAttribs({ "colorPick": true });

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, "textureeffect rectangle");
shader.setSource(shader.getDefaultVertexShader(), attachments.rectangle_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

let uniHeight = new CGL.Uniform(shader, "f", "height", 0);
let unWidth = new CGL.Uniform(shader, "f", "width", 0);
let uniX = new CGL.Uniform(shader, "f", "x", 0);
let uniY = new CGL.Uniform(shader, "f", "y", 0);

r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);
inWidth.set(0.25);
inHeight.set(0.25);

let uniformR = new CGL.Uniform(shader, "f", "r", r);
let uniformG = new CGL.Uniform(shader, "f", "g", g);
let uniformB = new CGL.Uniform(shader, "f", "b", b);
let uniformA = new CGL.Uniform(shader, "f", "a", a);

render.onTriggered = function ()
{
    let w = inWidth.get();
    let h = inHeight.get();
    let x = inPosX.get();
    let y = inPosY.get();

    if (w < 0)
    {
        x += w;
        w *= -1;
    }
    if (h < 0)
    {
        y += h;
        h *= -1;
    }

    uniX.set(x);
    uniY.set(y);
    uniHeight.set(h);
    unWidth.set(w);

    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
