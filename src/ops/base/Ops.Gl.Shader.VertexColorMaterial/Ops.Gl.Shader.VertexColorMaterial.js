const cgl=op.patch.cgl;
const render=op.inTrigger("render");
const trigger=op.outTrigger('trigger');
const opacity=op.inValueFloat("opacity",1);

var shader=new CGL.Shader(cgl,'vertex color material');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.uniOpacity=new CGL.Uniform(shader,'f','opacity',opacity.get());
shader.setSource(attachments.vertexcolor_vert,attachments.vertexcolor_frag);

render.onTriggered=doRender;

opacity.onChange=function()
{
    shader.uniOpacity.setValue(opacity.get());
};

function doRender()
{
    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();
}