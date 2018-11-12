const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const amplitude = op.inValueSlider("Amplitude",0.5);
const frequency = op.inValue("Frequency",2.0);
const lineWidth = op.inValueSlider("Line Width",0.5);
const lineGlow = op.inValueSlider("Line Glow",0.5);
const waveSelect = op.inValueInt("Wave Select",0);
const inTime=op.inValueSlider("Animate",0.0);

const uniWidth = op.inValue("Resolution X");
const uniHeight = op.inValue("Resolution Y");
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const srcFrag=(attachments.wave_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);

const amplitudeUniform=new CGL.Uniform(shader,'f','uAmp',amplitude);
const frequencyUniform=new CGL.Uniform(shader,'f','uFreq',frequency);
const lineWidthUniform=new CGL.Uniform(shader,'f','uWidth',lineWidth);
const lineGlowUniform=new CGL.Uniform(shader,'f','uGlow',lineGlow);
const waveSelectUniform=new CGL.Uniform(shader,'f','uWaveSelect',waveSelect);

const timeUniform=new CGL.Uniform(shader,'f','uTime',inTime);
const resXUniform=new CGL.Uniform(shader,'f','uResX',uniWidth);
const resYUniform=new CGL.Uniform(shader,'f','uResY',uniHeight);


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
    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);


    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
