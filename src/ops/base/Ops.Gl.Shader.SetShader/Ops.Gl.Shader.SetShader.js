const render=op.inFunction("render");
const shader=op.inObject("shader");
const trigger=op.outFunction("trigger");

const cgl=op.patch.cgl;
shader.ignoreValueSerialize=true;
render.onTriggered=doRender;

function doRender()
{
    if(shader.get())
    {
        cgl.setShader(shader.get());
        if(shader.get().bindTextures) shader.get().bindTextures();
        trigger.trigger();
        cgl.setPreviousShader();
    }
    else 
    {
        trigger.trigger();
    }
}

