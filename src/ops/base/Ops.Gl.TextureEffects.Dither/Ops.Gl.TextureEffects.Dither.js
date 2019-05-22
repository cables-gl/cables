const
    render=op.inTrigger("Render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    trigger=op.outTrigger("Trigger"),
    strength=op.inValue("strength",2),
    threshold=op.inValueSlider("threshold",0.35);

const
    cgl=op.patch.cgl,
    shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.dither_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    strengthUniform=new CGL.Uniform(shader,'f','strength',strength),
    uniWidth=new CGL.Uniform(shader,'f','width',0),
    uniHeight=new CGL.Uniform(shader,'f','height',0),
    unithreshold=new CGL.Uniform(shader,'f','threshold',threshold);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
