const
    render=op.inTrigger("render"),
    multiplierTex = op.inTexture("Multiplier"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    scaleX=op.inValue("Scale X",1.5),
    scaleY=op.inValue("Scale Y",1.5),
    offsetX=op.inValueSlider("offset X",0),
    offsetY=op.inValueSlider("offset Y",0),
    centerX=op.inValueSlider("center X",0.5),
    centerY=op.inValueSlider("center Y",0.5),
    trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.scale_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    textureMultiplierUniform=new CGL.Uniform(shader,'t','multiplierTex',1),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    scaleXUniform=new CGL.Uniform(shader,'f','uScaleX',scaleX),
    scaleYUniform=new CGL.Uniform(shader,'f','uScaleY',scaleY),
    centerXUniform=new CGL.Uniform(shader,'f','centerX',centerX),
    centerYUniform=new CGL.Uniform(shader,'f','centerY',centerY),
    offsetXUniform=new CGL.Uniform(shader,'f','offsetX',offsetX),
    offsetYUniform=new CGL.Uniform(shader,'f','offsetY',offsetY);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

multiplierTex.onChange = function()
{
    shader.toggleDefine('MASK_SCALE',multiplierTex.isLinked());
}

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

