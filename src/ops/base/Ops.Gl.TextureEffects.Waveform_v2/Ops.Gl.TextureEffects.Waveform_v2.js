const
    render = op.inTrigger('render'),
    blendMode = CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount = op.inValueSlider("Amount",1),
    waveSelect = op.inValueSelect("Waveform",["Sine","Sawtooth","Triangle","Square"],"Sine"),
    amplitude = op.inValueSlider("Amplitude",0.5),
    frequency = op.inFloat("Frequency",2.0),
    lineWidth = op.inValueSlider("Line Width",0.1),
    lineGlow = op.inValueSlider("Line Glow",0.1),
    invertCol = op.inValueBool("invert color",false),
    solidFill = op.inValueBool("Solid fill",false),
    offsetX = op.inValueSlider("Offset X",0.0),
    offsetY = op.inValueSlider("Offset Y",0.5),
    rotate = op.inValueSlider("Rotate",0.0),
    r = op.inValueSlider("r",1.0),
    g = op.inValueSlider("g",1.0),
    b = op.inValueSlider("b",1.0);

const trigger = op.outTrigger('trigger');

r.setUiAttribs({colorPick:true});

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.wave_v2_frag);

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

waveSelect.onChange = invertCol.onChange= updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("SINE",waveSelect.get() == "Sine");
    shader.toggleDefine("SAWTOOTH",waveSelect.get() == "Sawtooth");
    shader.toggleDefine("TRIANGLE",waveSelect.get() == "Triangle");
    shader.toggleDefine("SQUARE",waveSelect.get() == "Square");
    shader.toggleDefine("INVERT",invertCol.get() == true);
}

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered = function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
