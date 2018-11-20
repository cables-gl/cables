const render = op.inTrigger('render');
const blendMode = CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount = op.inValueSlider("Amount",1);
const waveSelect = op.inValueSelect("Waveform",["Sine","Sawtooth","Triangle","Square"],"Sine");

const amplitude = op.inValueSlider("Amplitude",0.5);
const frequency = op.inValue("Frequency",2.0);
const lineWidth = op.inValueSlider("Line Width",0.1);
const lineGlow = op.inValueSlider("Line Glow",0.1);
const invertCol = op.inValueBool("invert color",false);
const solidFill = op.inValueBool("Solid fill",false);
const offsetX = op.inValueSlider("Offset X",0.0);
const offsetY = op.inValueSlider("Offset Y",0.5);
const rotate = op.inValueSlider("Rotate",0.0);

const r = op.inValueSlider("r",1.0);
const g = op.inValueSlider("g",1.0);
const b = op.inValueSlider("b",1.0);

const trigger = op.outTrigger('trigger');

r.setUiAttribs({colorPick:true});


const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl);

const srcFrag = (attachments.wave_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform = new CGL.Uniform(shader,'t','tex',0);
const amountUniform = new CGL.Uniform(shader,'f','amount',amount);
const uniformR = new CGL.Uniform(shader,'f','r',r);
const uniformG = new CGL.Uniform(shader,'f','g',g);
const uniformB = new CGL.Uniform(shader,'f','b',b);

const amplitudeUniform = new CGL.Uniform(shader,'f','uAmp',amplitude);
const frequencyUniform = new CGL.Uniform(shader,'f','uFreq',frequency);
const lineWidthUniform = new CGL.Uniform(shader,'f','uWidth',lineWidth);
const lineGlowUniform = new CGL.Uniform(shader,'f','uGlow',lineGlow);
const waveSelectUniform = new CGL.Uniform(shader,'f','uWaveSelect',1);
const invertUniform = new CGL.Uniform(shader,'b','uInvert',invertCol);
const solidFillUniform = new CGL.Uniform(shader,'b','uSolid',solidFill);
const offSetXUniform = new CGL.Uniform(shader,'f','uOffSetX',offsetX);
const offSetYUniform = new CGL.Uniform(shader,'f','uOffSetY',offsetY);
const rotateUniform = new CGL.Uniform(shader,'f','uRotate',rotate);

waveSelect.onChange = updateWaveForm;
updateWaveForm();

function updateWaveForm()
{
    if(waveSelect.get() == "Sine") waveSelectUniform.setValue(0);
    else if(waveSelect.get() == "Sawtooth") waveSelectUniform.setValue(1);
    else if(waveSelect.get() == "Triangle") waveSelectUniform.setValue(2);
    else waveSelectUniform.setValue(3);
}

blendMode.onChange = function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered = function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
