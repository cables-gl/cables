const render=op.inTrigger('render');
const trigger=op.outTrigger('trigger');
const cgl=op.patch.cgl;

function doRender()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
}

var shader=new CGL.Shader(cgl,'showtexcoords material');

shader.setSource(shader.getDefaultVertexShader(),attachments.showtexcoord_frag);

render.onTriggered=doRender;
doRender();
