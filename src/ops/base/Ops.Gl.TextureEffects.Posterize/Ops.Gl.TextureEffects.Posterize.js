const
    render=op.inTrigger("Render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    levels=op.inValue("levels",2),
    trigger=op.outTrigger("Trigger");

const
    cgl=op.patch.cgl,
    shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.posterize_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    levelsUniform=new CGL.Uniform(shader,'f','levels',levels),
    uniWidth=new CGL.Uniform(shader,'f','texWidth',128),
    uniHeight=new CGL.Uniform(shader,'f','texHeight',128),
    uniAmount=new CGL.Uniform(shader,'f','amount',amount);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
