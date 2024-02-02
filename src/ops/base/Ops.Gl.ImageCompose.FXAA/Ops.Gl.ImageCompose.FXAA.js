// shader from: https://github.com/mattdesl/glsl-fxaa

let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");
let fxaa_span = op.inValueSelect("span", [0, 2, 4, 8, 16, 32, 64]);
let fxaa_reduceMin = op.inValueFloat("reduceMin");
let fxaa_reduceMul = op.inValueFloat("reduceMul");
let useVPSize = op.inValueBool("use viewport size", true);
let texWidth = op.inValueInt("width");
let texHeight = op.inValueInt("height");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.fxaa_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    cgl.pushShader(shader);

    if (cgl.getViewPort()[2] != texWidth.get() || cgl.getViewPort()[3] != texHeight.get())
    {
        changeRes();
    }

    cgl.currentTextureEffect.bind();
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();

    cgl.popShader();

    trigger.trigger();
};

let uniformSpan = new CGL.Uniform(shader, "f", "FXAA_SPAN_MAX", 0);
let uniformMul = new CGL.Uniform(shader, "f", "FXAA_REDUCE_MUL", 0);
let uniformMin = new CGL.Uniform(shader, "f", "FXAA_REDUCE_MIN", 0);

fxaa_span.onChange = function ()
{
    uniformSpan.setValue(parseInt(fxaa_span.get(), 10));
};

let uWidth = new CGL.Uniform(shader, "f", "width", 0);
let uHeight = new CGL.Uniform(shader, "f", "height", 0);

function changeRes()
{
    if (useVPSize.get())
    {
        let w = cgl.getViewPort()[2];
        let h = cgl.getViewPort()[3];
        uWidth.setValue(w);
        uHeight.setValue(h);
        // texWidth.set(w);
        // texHeight.set(h);
    }
    else
    {
        uWidth.setValue(texWidth.get());
        uHeight.setValue(texHeight.get());
    }
}

texWidth.onChange = changeRes;
texHeight.onChange = changeRes;
useVPSize.onChange = changeRes;
op.onResize = changeRes;

fxaa_span.set(8);
// texWidth.set(1920);
// texHeight.set(1080);

fxaa_reduceMul.onChange = function ()
{
    uniformMul.setValue(1.0 / fxaa_reduceMul.get());
};

fxaa_reduceMin.onChange = function ()
{
    uniformMin.setValue(1.0 / fxaa_reduceMin.get());
};

fxaa_reduceMul.set(8);
fxaa_reduceMin.set(128);
