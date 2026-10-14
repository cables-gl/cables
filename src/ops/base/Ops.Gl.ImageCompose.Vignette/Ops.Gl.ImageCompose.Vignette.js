let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let amount = op.inFloatSlider("Amount", 1);
// var lensRadius1=op.inFloat("lensRadius1",0.8);
let lensRadius1 = op.inFloatSlider("Radius", 0.5);
let sharp = op.inFloatSlider("sharp", 0.25);
let aspect = op.inFloat("Aspect", 1);

const r = op.inFloatSlider("r", Math.random());
const g = op.inFloatSlider("g", Math.random());
const b = op.inFloatSlider("b", Math.random());
r.setUiAttribs({ "colorPick": true });

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.vignette_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

let uniLensRadius1 = new CGL.Uniform(shader, "f", "lensRadius1", lensRadius1);
let uniaspect = new CGL.Uniform(shader, "f", "aspect", aspect);
let uniAmount = new CGL.Uniform(shader, "f", "amount", amount);
let unisharp = new CGL.Uniform(shader, "f", "sharp", sharp);

let unir = new CGL.Uniform(shader, "f", "r", r);
let unig = new CGL.Uniform(shader, "f", "g", g);
let unib = new CGL.Uniform(shader, "f", "b", b);

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
