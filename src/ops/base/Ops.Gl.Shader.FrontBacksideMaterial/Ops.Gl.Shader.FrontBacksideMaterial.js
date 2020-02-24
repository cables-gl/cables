const render=op.inTrigger("render");
const next=op.outTrigger("next");
const cgl=op.patch.cgl;

const shader=new CGL.Shader(cgl,'showtexcoords material');
shader.setSource(shader.getDefaultVertexShader(),attachments.frontbacksidematerial_frag);
render.onTriggered=doRender;

function doRender()
{
    cgl.pushShader(shader);
    next.trigger();
    cgl.popShader();
}

