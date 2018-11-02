const render=op.inTrigger("render");
const next=op.outTrigger("next");
const cgl=op.patch.cgl;

const shader=new CGL.Shader(cgl,'showtexcoords material');
shader.setSource(shader.getDefaultVertexShader(),attachments.frontbacksidematerial_frag);
render.onTriggered=doRender;

function doRender()
{
    cgl.setShader(shader);
    next.trigger();
    cgl.setPreviousShader();
}

