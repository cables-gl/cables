const
    render=op.inTrigger("render"),
    amount=op.inValueSlider("Amount",1),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    time=op.inValue('Seed',0.5),
    inFrequency=op.inValue('frequency',1),
    inStrength=op.inValue('strength',8.0),
    inBlockSizeA=op.inValue('Block size small x',24.0),
    inBlockSizeB=op.inValue('Block size small y',9.0),
    inBlockSizeC=op.inValue('Block size large x',8.0),
    inBlockSizeD=op.inValue('Block size large y',4.0),
    inScrollX=op.inValue('Scroll X',0.0),
    inScrollY=op.inValue('Scroll Y',0.0),
    trigger=op.outTrigger('trigger');

const TEX_SLOT=0;
const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),attachments.glitchnoise_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',TEX_SLOT),
    uniformAmount=new CGL.Uniform(shader,'f','amount',amount),
    timeUniform=new CGL.Uniform(shader,'f','time',time),
    frequencyUniform=new CGL.Uniform(shader,'f','frequency',inFrequency),
    strengthUniform=new CGL.Uniform(shader,'f','strength',inStrength),
    sizeAUniform=new CGL.Uniform(shader,'f','blockSizeA',inBlockSizeA),
    sizeBUniform=new CGL.Uniform(shader,'f','blockSizeB',inBlockSizeB),
    sizeCUniform=new CGL.Uniform(shader,'f','blockSizeC',inBlockSizeC),
    sizeDUniform=new CGL.Uniform(shader,'f','blockSizeD',inBlockSizeD),
    scrollXUniform=new CGL.Uniform(shader,'f','scrollX',inScrollX),
    scrollYUniform=new CGL.Uniform(shader,'f','scrollY',inScrollY);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(TEX_SLOT, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};