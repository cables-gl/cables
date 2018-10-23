
var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var value=op.addInPort(new Port(op,"value",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var shader=op.addInPort(new Port(op,"shader true",CABLES.OP_PORT_TYPE_OBJECT));
var shader2=op.addInPort(new Port(op,"shader false",CABLES.OP_PORT_TYPE_OBJECT));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var shaderOut=op.addOutPort(new Port(op,"shaderOut",CABLES.OP_PORT_TYPE_OBJECT));

var cgl=op.patch.cgl;

shaderOut.ignoreValueSerialize=true;
shader.ignoreValueSerialize=true;
shader2.ignoreValueSerialize=true;

var doRender=function()
{
    if(value.get())
    {
        if(shader.get())
        {
            cgl.setShader(shader.get());
            shaderOut.set(shader.get());
            shader.get().bindTextures();
            trigger.trigger();
            cgl.setPreviousShader();
        }
    }
    else
    {
        if(shader2.get())
        {
            cgl.setShader(shader2.get());
            shaderOut.set(shader2.get());
            shader2.get().bindTextures();
            trigger.trigger();
            cgl.setPreviousShader();
        }
        
    }
    
    
    
};

render.onTriggered=doRender;
doRender();
