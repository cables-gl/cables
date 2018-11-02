const render=op.inTrigger("render");
const amount=op.inValueSlider("Amount",1);
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const time=op.inValue('Seed',0.5);
const inFrequency=op.inValue('frequency',1);
const inStrength=op.inValue('strength',8.0);
const inBlockSizeA=op.inValue('Block size small x',24.0);
const inBlockSizeB=op.inValue('Block size small y',9.0);
const inBlockSizeC=op.inValue('Block size large x',8.0);
const inBlockSizeD=op.inValue('Block size large y',4.0);
const inScrollX=op.inValue('Scroll X',0.0);
const inScrollY=op.inValue('Scroll Y',0.0);
const trigger=op.outTrigger('trigger');

const TEX_SLOT=0;
const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);
const srcFrag=(attachments.interference_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',TEX_SLOT);
const uniformAmount=new CGL.Uniform(shader,'f','amount',amount);
const timeUniform=new CGL.Uniform(shader,'f','time',time);
const frequencyUniform=new CGL.Uniform(shader,'f','frequency',inFrequency);
const strengthUniform=new CGL.Uniform(shader,'f','strength',inStrength);

const sizeAUniform=new CGL.Uniform(shader,'f','blockSizeA',inBlockSizeA);
const sizeBUniform=new CGL.Uniform(shader,'f','blockSizeB',inBlockSizeB);
const sizeCUniform=new CGL.Uniform(shader,'f','blockSizeC',inBlockSizeC);
const sizeDUniform=new CGL.Uniform(shader,'f','blockSizeD',inBlockSizeD);

const scrollXUniform=new CGL.Uniform(shader,'f','scrollX',inScrollX);
const scrollYUniform=new CGL.Uniform(shader,'f','scrollY',inScrollY);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

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