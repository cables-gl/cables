const
    render=op.inTrigger('render'),
    value=op.inValueBool("value"),
    shader=op.inObject("shader true"),
    shader2=op.inObject("shader false"),
    trigger=op.outTrigger('trigger'),
    shaderOut=op.outObject("shaderOut");

var cgl=op.patch.cgl;

shaderOut.ignoreValueSerialize=true;
shader.ignoreValueSerialize=true;
shader2.ignoreValueSerialize=true;

render.onTriggered=doRender;
doRender();

function doRender()
{
    if(value.get())
    {
        if(shader.get())
        {
            cgl.pushShader(shader.get());
            shaderOut.set(shader.get());
            shader.get().bindTextures();
            trigger.trigger();
            cgl.popShader();
        }
    }
    else
    {
        if(shader2.get())
        {
            cgl.pushShader(shader2.get());
            shaderOut.set(shader2.get());
            shader2.get().bindTextures();
            trigger.trigger();
            cgl.popShader();
        }
    }
}