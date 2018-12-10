const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const inMultiply=op.inValue("Multiply texture",1.0);
const inGamma=op.inValue("Gamma correction",2.2);

const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const srcFrag=(attachments.gamma_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const multiplyUniform=new CGL.Uniform(shader,'f','multiplyAmount',inMultiply);
const gammaUniform=new CGL.Uniform(shader,'f','gammaAmount',inGamma);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

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
