var cgl=op.patch.cgl;

op.name='SetShader';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var shader=op.addInPort(new Port(op,"shader",OP_PORT_TYPE_OBJECT));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

shader.ignoreValueSerialize=true;
render.onTriggered=doRender;
doRender();

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

