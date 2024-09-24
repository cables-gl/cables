const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    inRed = op.inValueSlider("Red");

const cgl = op.patch.cgl;

const shader = new CGL.Shader(cgl, "MinimalMaterial");
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
shader.setSource(attachments.shader_vert, attachments.shader_frag);

shader.addUniformFrag("f", "red", inRed);

render.onTriggered = doRender;

function doRender()
{
    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();
}
