const
    render = op.inTrigger("Render"),
    inFade = op.inFloatSlider("Fade", 1),
    inTex = op.inTexture("GlArray"),

    trigger = op.outTrigger("trigger"),
    outTex = op.outTexture("Result");

render.onTriggered = dorender;

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);
const texMath = new CGL.ShaderTextureMath(cgl, op.objName, { "texturePort": inTex });

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbMath_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const fadeUnif = new CGL.Uniform(shader, "f", "fade", inFade);

function dorender()
{
    const finTex = texMath.render(shader);
    outTex.set(finTex);
    trigger.trigger();
}
