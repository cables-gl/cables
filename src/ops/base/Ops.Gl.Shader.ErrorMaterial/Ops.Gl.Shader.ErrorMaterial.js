const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "errormaterial");

shader.setSource(CGL.Shader.getDefaultVertexShader(), CGL.Shader.getErrorFragmentShader());
render.onTriggered = doRender;

function doRender()
{
    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();
}
