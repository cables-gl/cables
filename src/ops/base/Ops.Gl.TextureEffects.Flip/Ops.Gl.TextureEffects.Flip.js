const render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
const x=op.inValueBool("X");
const y=op.inValueBool("Y");
const trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.flip_frag);

const uniTexture=new CGL.Uniform(shader,'t','tex',0);
const uniX=new CGL.Uniform(shader,'f','x',x);
const uniY=new CGL.Uniform(shader,'f','y',y);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
