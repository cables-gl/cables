const
    render=op.inTrigger("render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    offsetX=op.inFloat("Offset X",0),
    offsetY=op.inFloat("Offset Y",0),
    zoom=op.inFloat("Zoom",5),
    iterations=op.inInt("Iterations",50),
    randomSeed=op.inInt("Seed",5711),
    spotEdge=op.inFloatSlider("Spot edge",0.5),
    gamma=op.inFloat("Gamma",0.75),
    trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.lensDirt_frag );

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    offsetXUniformX=new CGL.Uniform(shader,'f','uOffsetX',offsetX),
    offsetXUniformY=new CGL.Uniform(shader,'f','uOffsetY',offsetY),
    zoomUniform=new CGL.Uniform(shader,'f','uZoom',zoom),
    iterationsUniform=new CGL.Uniform(shader,'i','uIterations',iterations),
    randomSeedUniform=new CGL.Uniform(shader,'i','uRandomSeed',randomSeed),
    spotEdgeUniform=new CGL.Uniform(shader,'f','uSpotEdge',spotEdge),
    gammaUniform=new CGL.Uniform(shader,'f','uGamma',gamma),
    uniformAspect=new CGL.Uniform(shader,'f','uAspect',1.0),

    amountUniform=new CGL.Uniform(shader,'f','amount',amount);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    uniformAspect.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width/cgl.currentTextureEffect.getCurrentSourceTexture().height);
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
