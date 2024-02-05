let render = op.inTrigger("Render");

let inMin = op.inValueSlider("In Min", 0);
let inMid = op.inValueSlider("Midpoint", 0.5);
let inMax = op.inValueSlider("In Max", 1);

let outMin = op.inValueSlider("Out Min", 0);
let outMax = op.inValueSlider("Out Max", 1);

let trigger = op.addOutPort(new CABLES.Port(op, "Next", CABLES.OP_PORT_TYPE_FUNCTION));

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

let uniInMin = new CGL.Uniform(shader, "f", "inMin", inMin);
let uniInMid = new CGL.Uniform(shader, "f", "midPoint", inMid);
let uniInMax = new CGL.Uniform(shader, "f", "inMax", inMax);

let uniOutMin = new CGL.Uniform(shader, "f", "outMin", outMin);
let uniOutMax = new CGL.Uniform(shader, "f", "outMax", outMax);

shader.setSource(shader.getDefaultVertexShader(), attachments.levels_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

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
