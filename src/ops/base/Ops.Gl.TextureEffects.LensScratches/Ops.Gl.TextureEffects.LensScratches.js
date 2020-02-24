const
    render=op.inTrigger("render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    offsetX=op.inFloat("Offset X",0),
    offsetY=op.inFloat("Offset Y",0),
    wavyness=op.inFloatSlider("Wavyness",0.5),
    scale=op.inFloat("scale",10),
    layers=op.inInt("Layers",4),
    antiAliasIterations=op.inFloat("AA iterations",4.0),
    frequency=op.inFloat("Frequency",0.5),
    frequencyStep=op.inFloat("Frequency step size",0.5),


    trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.lensScratches_frag );

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    offsetXUniformX=new CGL.Uniform(shader,'f','uOffsetX',offsetX),
    offsetXUniformY=new CGL.Uniform(shader,'f','uOffsetY',offsetY),
    wavynessUniform=new CGL.Uniform(shader,'f','uWavyness',wavyness),
    scaleUniform=new CGL.Uniform(shader,'f','uScale',scale),
    layersUniform=new CGL.Uniform(shader,'i','uLayers',layers),
    antiAliasIterationsUniform=new CGL.Uniform(shader,'f','uAntiAliasIterations',antiAliasIterations),
    frequencyUniform=new CGL.Uniform(shader,'f','uFrequency',frequency),
    frequencyStepUniform=new CGL.Uniform(shader,'f','uFrequencyStep',frequencyStep),
    uniformTextureWidth=new CGL.Uniform(shader,'f','uResWidth',1.0),
    uniformTextureHeight=new CGL.Uniform(shader,'f','uResHeight',1.0),
    uniformAspect=new CGL.Uniform(shader,'f','uAspect',1.0),

    amountUniform=new CGL.Uniform(shader,'f','amount',amount);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniformAspect.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width
                            /cgl.currentTextureEffect.getCurrentSourceTexture().height);

    uniformTextureWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniformTextureHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
