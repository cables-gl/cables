const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");
const cgl = op.patch.cgl;

function doRender()
{
    cgl.pushShader(shader);
    trigger.trigger();
    cgl.popShader();
}

const shader = new CGL.Shader(cgl, "showtexcoords material");

shader.setSource(attachments.pos_vert, attachments.pos_frag);

render.onTriggered = doRender;
doRender();
