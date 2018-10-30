const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");
const inRed=op.inValueSlider("Red");

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
const uni=new CGL.Uniform(shader,'f','red',inRed);


render.onTriggered=doRender;