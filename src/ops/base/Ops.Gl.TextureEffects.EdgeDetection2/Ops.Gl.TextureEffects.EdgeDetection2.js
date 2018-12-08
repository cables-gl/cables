const render=op.inTrigger("Render");
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);

const strength=op.inValueSlider("strength",1);
const mulColor=op.inValueSlider("Mul Color",0);

const trigger=op.outTrigger("Trigger");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const srcFrag=(attachments.edgedetect_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);

const strengthUniform=new CGL.Uniform(shader,'f','strength',strength);
const uniWidth=new CGL.Uniform(shader,'f','texWidth',128);
const uniHeight=new CGL.Uniform(shader,'f','texHeight',128);
const uniMulColor=new CGL.Uniform(shader,'f','mulColor',mulColor);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};