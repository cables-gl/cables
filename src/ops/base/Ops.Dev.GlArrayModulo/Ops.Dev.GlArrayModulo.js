const
    render = op.inTrigger("Render"),
    inTex = op.inTexture("GlArray"),

    inDoModX = op.inBool("X", true),
    inModX = op.inValue("Modulo X", 1),

    inDoModY = op.inBool("Y", true),
    inModY = op.inValue("Modulo Y", 1),

    inDoModZ = op.inBool("Z", true),
    inModZ = op.inValue("Modulo Z", 1),

    trigger = op.outTrigger("trigger"),
    outTex = op.outTexture("Result");

render.onTriggered = dorender;

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);
const texMath = new CGL.ShaderTextureMath(cgl, op.objName, { "texturePort": inTex });

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbMath_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniModX = new CGL.Uniform(shader, "f", "modX", inModX),
    uniModY = new CGL.Uniform(shader, "f", "modY", inModY),
    uniModZ = new CGL.Uniform(shader, "f", "modZ", inModZ);

inDoModX.onChange =
inDoModY.onChange =
inDoModZ.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("MOD_MODULO_X", inDoModX.get());
    inModX.setUiAttribs({ "greyout": !inDoModX.get() });

    shader.toggleDefine("MOD_MODULO_Y", inDoModY.get());
    inModY.setUiAttribs({ "greyout": !inDoModY.get() });

    shader.toggleDefine("MOD_MODULO_Z", inDoModZ.get());
    inModZ.setUiAttribs({ "greyout": !inDoModZ.get() });
}

function dorender()
{
    const finTex = texMath.render(shader);
    outTex.set(finTex);
    trigger.trigger();
}
