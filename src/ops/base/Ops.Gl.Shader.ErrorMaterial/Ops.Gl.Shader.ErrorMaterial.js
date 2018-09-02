const render=op.inFunction("render");
const trigger=op.outFunction("trigger");

const cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'errormaterial');

shader.setSource(CGL.Shader.getDefaultVertexShader(), CGL.Shader.getErrorFragmentShader());
render.onTriggered=doRender;

function doRender()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
}

