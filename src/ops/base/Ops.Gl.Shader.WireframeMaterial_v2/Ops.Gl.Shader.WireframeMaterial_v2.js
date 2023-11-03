const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    enableDepth = op.inValueBool("enable depth testing", true),
    w = op.inFloat("width", 1),
    aa = op.inValueSlider("AntiAlias", 0.95),
    r = op.inValueSlider("diffuse r", 1),
    g = op.inValueSlider("diffuse g", 1),
    b = op.inValueSlider("diffuse b", 1),
    a = op.inValueSlider("diffuse A", 1),
    fill = op.inValueBool("fill", true),
    fr = op.inValueSlider("Fill R", 0.5),
    fg = op.inValueSlider("Fill G", 0.5),
    fb = op.inValueSlider("Fill B", 0.5),
    fa = op.inValueSlider("Fill A", 1);

op.setPortGroup("Color Wire", [r, g, b, a]);
op.setPortGroup("Color Fill", [fr, fg, fb, fa, fill]);
r.setUiAttribs({ "colorPick": true });
fr.setUiAttribs({ "colorPick": true });
fill.onChange = setDefines;

const cgl = op.patch.cgl;

function setDefines()
{
    if (shader) shader.toggleDefine("WIREFRAME_FILL", fill.get());

    fr.setUiAttribs({ "greyout": !fill.get() });
    fg.setUiAttribs({ "greyout": !fill.get() });
    fb.setUiAttribs({ "greyout": !fill.get() });
    fa.setUiAttribs({ "greyout": !fill.get() });
}



let doRender = function ()
{
    cgl.pushDepthTest(enableDepth.get());

    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();

    cgl.popDepthTest();
};

const shader = new CGL.Shader(cgl, "Wireframe Material");
const uniformWidth = new CGL.Uniform(shader, "f", "width", w);
const uniaa = new CGL.Uniform(shader, "f", "aa", aa);
const uni1 = new CGL.Uniform(shader, "4f", "colorFill", fr, fg, fb, fa);
const uni2 = new CGL.Uniform(shader, "4f", "colorWire", r, g, b, a);

shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
shader.setSource(attachments.wireframe_vert || "", attachments.wireframe_frag || "");
shader.wireframe = true;
setDefines();

if (cgl.glVersion == 1)
{
    if (!cgl.gl.getExtension("OES_standard_derivatives")) op.setUiError("noderivatives", "no standard derivatives extension available!");
    shader.enableExtension("OES_standard_derivatives");
}

render.onTriggered = doRender;

doRender();
