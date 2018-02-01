
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var lineSize=op.inValue("Size",10);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.checkerboard_frag);

var uniLineSize=new CGL.Uniform(shader,'f','lineSize',lineSize);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
