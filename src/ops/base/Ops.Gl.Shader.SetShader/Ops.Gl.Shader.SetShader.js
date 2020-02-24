const render=op.inTrigger("render");
const shader=op.inObject("shader");
const trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
shader.ignoreValueSerialize=true;
render.onTriggered=doRender;

function doRender()
{
    if(shader.get())
    {
        cgl.pushShader(shader.get());
        if(shader.get().bindTextures) shader.get().bindTextures();
        trigger.trigger();
        cgl.popShader();
    }
    else 
    {
        trigger.trigger();
    }
}

