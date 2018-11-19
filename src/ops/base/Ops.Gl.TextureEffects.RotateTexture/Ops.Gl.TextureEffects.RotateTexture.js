const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const inRotate=op.inValueSlider("Rotate",0.0);
const inResX=op.inValue("Resolution X",512);
const inResY=op.inValue("Resolution Y",512);

const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const srcFrag=(attachments.rotate_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);


//inResX = cgl.currentTextureEffect.getCurrentSourceTexture().width;
//inResY = cgl.currentTextureEffect.getCurrentSourceTexture().height;

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
// const uniWidth=new CGL.Uniform(shader,'f','resX',inResX);
// const uniHeight=new CGL.Uniform(shader,'f','resY',inResY);

const rotateUniform=new CGL.Uniform(shader,'f','rotate',inRotate);

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

    // uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    // uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    trigger.trigger();
};
