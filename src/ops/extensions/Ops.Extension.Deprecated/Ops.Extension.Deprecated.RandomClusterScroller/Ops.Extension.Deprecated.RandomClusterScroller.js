let render = op.inTrigger("render");

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.scroller_frag);

let time = op.inValue("Time");
let uniTime = new CGL.Uniform(shader, "f", "time", time);

let num = op.inValue("num", 20);
let uninum = new CGL.Uniform(shader, "f", "num", num);

let blur = op.inValueSlider("blur", 0.0);
let uniBlur = new CGL.Uniform(shader, "f", "blur", blur);

let minSize = op.inValueSlider("Min Size", 0.1);
minSize.uniform = new CGL.Uniform(shader, "f", "minSize", minSize);

let maxSize = op.inValueSlider("Max Size", 0.2);
maxSize.uniform = new CGL.Uniform(shader, "f", "maxSize", maxSize);

let opacity = op.inValueSlider("Opacity", 1);
opacity.uniform = new CGL.Uniform(shader, "f", "opacity", opacity);

let prim = op.inValueSelect("Primitive", ["Rectangle", "Circle"], "Rectangle");

prim.onChange = function ()
{
    shader.removeDefine("PRIM_RECT");
    shader.removeDefine("PRIM_CIRCLE");

    if (prim.get() == "Circle")shader.define("PRIM_CIRCLE");
    if (prim.get() == "Rectangle")shader.define("PRIM_RECT");
};

shader.define("PRIM_RECT");
render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    // cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    //

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
