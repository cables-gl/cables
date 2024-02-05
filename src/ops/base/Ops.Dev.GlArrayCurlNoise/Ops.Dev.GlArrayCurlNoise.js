const
    render = op.inTrigger("Render"),
    inTex = op.inTexture("GlArray"),
    scale = op.inValue("Scale", 1),
    time = op.inValue("Time", 0),

    inNormSpeed = op.inBool("Normalize Speed", false),

    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),
    z = op.inValue("Z", 0),
    a = op.inValue("a", 1),

    inOffset = op.inFloatSlider("offset", 0),
    trigger = op.outTrigger("trigger"),
    outTex = op.outTexture("Result");

let lastTime = time.get();
render.onTriggered = dorender;

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);
const texMath = new CGL.ShaderTextureMath(cgl, op.objName, { "texturePort": inTex });

shader.setSource(shader.getDefaultVertexShader(), attachments.curlnoise_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniformR = new CGL.Uniform(shader, "f", "x", x),
    uniformG = new CGL.Uniform(shader, "f", "y", y),
    uniformB = new CGL.Uniform(shader, "f", "z", z),
    uniformA = new CGL.Uniform(shader, "f", "scale", scale),
    uniformTimeDelta = new CGL.Uniform(shader, "f", "timeDelta", 0),
    uniforoffs = new CGL.Uniform(shader, "f", "offset", inOffset);

inNormSpeed.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("MOD_NORM_SPEED", inNormSpeed.get());
}

function dorender()
{
    uniformTimeDelta.set(time.get() - lastTime);
    lastTime = time.get();

    outTex.set(null);
    const finTex = texMath.render(shader);
    outTex.set(finTex);
    trigger.trigger();
}
