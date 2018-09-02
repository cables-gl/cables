const render=op.inFunction("render");
const trigger=op.inFunction("trigger");

const cgl=op.patch.cgl;

function doRender()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
}

var shader=new CGL.Shader(cgl,'MinimalMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.setSource(attachments.shader_vert,attachments.shader_frag);

render.onTriggered=doRender;

