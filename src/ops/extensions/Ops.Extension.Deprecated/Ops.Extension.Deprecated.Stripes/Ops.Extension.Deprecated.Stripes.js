let render = op.inTrigger("render");
let num = op.addInPort(new CABLES.Port(op, "num", CABLES.OP_PORT_TYPE_VALUE));
let width = op.addInPort(new CABLES.Port(op, "width", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let axis = op.addInPort(new CABLES.Port(op, "axis", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": ["X", "Y", "Diagonal", "Diagonal Flip"] }));

let offset = op.addInPort(new CABLES.Port(op, "offset", CABLES.OP_PORT_TYPE_VALUE));

let smoothed = op.inValueBool("Gradients");

let r = op.addInPort(new CABLES.Port(op, "r", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "colorPick": "true" }));
let g = op.addInPort(new CABLES.Port(op, "g", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let b = op.addInPort(new CABLES.Port(op, "b", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let a = op.addInPort(new CABLES.Port(op, "a", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));

let trigger = op.outTrigger("trigger");

smoothed.onChange = function ()
{
    if (smoothed.get())shader.define("STRIPES_SMOOTHED");
    else shader.removeDefine("STRIPES_SMOOTHED");
};

axis.onChange = function ()
{
    if (axis.get() == "X")uniAxis.setValue(0);
    if (axis.get() == "Y")uniAxis.setValue(1);
    if (axis.get() == "Diagonal")uniAxis.setValue(2);
    if (axis.get() == "Diagonal Flip")uniAxis.setValue(3);
};

let cgl = op.patch.cgl;
var shader = new CGL.Shader(cgl, "textureeffect stripes");
shader.setSource(shader.getDefaultVertexShader(), attachments.stripes_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

let numUniform = new CGL.Uniform(shader, "f", "num", num);
let uniWidth = new CGL.Uniform(shader, "f", "width", width);
var uniAxis = new CGL.Uniform(shader, "f", "axis", 0);
let uniOffset = new CGL.Uniform(shader, "f", "offset", offset);

r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);
axis.set("X");
num.set(5);
width.set(0.5);

let uniformR = new CGL.Uniform(shader, "f", "r", r);
let uniformG = new CGL.Uniform(shader, "f", "g", g);
let uniformB = new CGL.Uniform(shader, "f", "b", b);
let uniformA = new CGL.Uniform(shader, "f", "a", a);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
