const render=op.inTrigger('render');
const multiplierTex = op.inTexture("Multiplier");
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const amountX=op.inValue("width",320.0);
const amountY=op.inValue("height",180.0);
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.pixelate_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const textureMultiplierUniform=new CGL.Uniform(shader,'t','multiplierTex',1);
const amountUniform =new CGL.Uniform(shader,'f','amount',amount);
const amountXUniform=new CGL.Uniform(shader,'f','amountX',0.0);
const amountYUniform=new CGL.Uniform(shader,'f','amountY',0.0);

amountX.onChange=function()
{
    amountXUniform.setValue(amountX.get());
};

amountY.onChange=function()
{
    amountYUniform.setValue(amountY.get());
};
multiplierTex.onChange = function()
{
    shader.toggleDefine('PIXELATE_TEXTURE',multiplierTex.isLinked());
};

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(multiplierTex.get()) cgl.setTexture(1, multiplierTex.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

