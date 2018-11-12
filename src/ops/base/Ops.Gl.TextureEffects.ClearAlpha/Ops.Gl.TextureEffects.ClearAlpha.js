const render=op.inFunction("render");
const amount=op.inValueSlider("Amount",1);
const trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,op.objName);


shader.setSource(shader.getDefaultVertexShader(),attachments.clearAlpha_frag||'');

var uniformAmount=new CGL.Uniform(shader,'f','amount',amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    // cgl.setTexture(TEX_SLOT, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
