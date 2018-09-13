var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var outShader=op.outObject("Shader");

var cgl=op.patch.cgl;

function doRender()
{
    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();
}

var shader=new CGL.Shader(cgl);

shader.setSource(attachments.normalsmaterial_vert,attachments.normalsmaterial_frag);
outShader.set(shader);
render.onTriggered=doRender;
doRender();