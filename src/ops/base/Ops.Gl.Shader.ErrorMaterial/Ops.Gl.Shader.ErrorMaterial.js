const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'errormaterial');

shader.setSource(CGL.Shader.getDefaultVertexShader(), CGL.Shader.getErrorFragmentShader());
render.onTriggered=doRender;

function doRender()
{
    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();
}

