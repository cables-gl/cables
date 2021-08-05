const
    render = op.inTrigger("Render"),
    inTex = op.inTexture("GlArray"),

    trigger = op.outTrigger("trigger"),
    outTex = op.outTexture("Result");

render.onTriggered = dorender;

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
const texMath = new CGL.ShaderTextureMath(cgl, op.objName, { "texturePort": inTex });

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbMath_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);



function dorender()
{
    const finTex = texMath.render(shader);
    outTex.set(finTex);
    trigger.trigger();
}
