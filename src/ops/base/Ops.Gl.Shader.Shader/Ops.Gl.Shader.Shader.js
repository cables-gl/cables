var cgl=op.patch.cgl;

op.name='Shader';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var shader=this.addInPort(new Port(this,"shader",OP_PORT_TYPE_OBJECT));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

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
}

