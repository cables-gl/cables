let cgl = op.patch.cgl;

let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let enableDepth = op.inValueBool("enable depth testing", true);

let fill = op.inValueBool("fill", true);

function setDefines()
{
    if (shader)
        if (fill.get()) shader.define("WIREFRAME_FILL");
        else shader.removeDefine("WIREFRAME_FILL");
}

fill.onChange = function ()
{
    setDefines();
};

let w = op.inValueSlider("width", 0.25);
w.onChange = function () { uniformWidth.setValue(w.get()); };

let opacity = op.inValueSlider("opacity", 1);
opacity.onChange = function () { uniformOpacity.setValue(opacity.get()); };

if (cgl.glVersion == 1 && !cgl.gl.getExtension("OES_standard_derivatives"))
{
    op.uiAttr({ "error": "no oes standart derivatives!" });
}
else
{
    op.uiAttr({ "error": null });
}

let doRender = function ()
{
    // if(true!==enableDepth.get()) cgl.gl.disable(cgl.gl.DEPTH_TEST);
    // else cgl.gl.enable(cgl.gl.DEPTH_TEST);
    cgl.pushDepthTest(enableDepth.get());

    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();

    // if(true!==enableDepth.get()) cgl.gl.enable(cgl.gl.DEPTH_TEST);
    cgl.popDepthTest();
};

const shader = new CGL.Shader(cgl, "Wireframe Material");

if (cgl.glVersion > 1)shader.glslVersion = 300;
const uniformWidth = new CGL.Uniform(shader, "f", "width", w.get());
const uniformOpacity = new CGL.Uniform(shader, "f", "opacity", opacity.get());

if (cgl.glVersion == 1)shader.enableExtension("OES_standard_derivatives");

shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
shader.setSource(attachments.wireframe_vert || "", attachments.wireframe_frag || "");
shader.wireframe = true;
setDefines();

// diffuse color
let r = op.inValueSlider("diffuse r", Math.random());
let g = op.inValueSlider("diffuse g", Math.random());
let b = op.inValueSlider("diffuse b", Math.random());

r.setUiAttribs({ "colorPick": true });

g.uniform = new CGL.Uniform(shader, "f", "g", g);
r.uniform = new CGL.Uniform(shader, "f", "r", r);
b.uniform = new CGL.Uniform(shader, "f", "b", b);

{
    // diffuse color

    let fr = op.inValueSlider("Fill R", Math.random());
    fr.setUiAttribs({ "colorPick": true });
    fr.uniform = new CGL.Uniform(shader, "f", "fr", fr);

    let fg = op.inValueSlider("Fill G", Math.random());
    fg.uniform = new CGL.Uniform(shader, "f", "fg", fg);

    let fb = op.inValueSlider("Fill B", Math.random());
    fb.uniform = new CGL.Uniform(shader, "f", "fb", fb);
}

render.onTriggered = doRender;

doRender();
