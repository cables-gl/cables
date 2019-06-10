const
    render=op.inTrigger("render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    mode=op.inValueSelect("Mode",['Sine','Sawtooth','Triangle'],'Sine'),
    freq=op.inValue("Frequency",4),
    pow=op.inValue("Pow factor",6),
    offset=op.inValue("Offset",0),
    rotate=op.inValue("Rotate",0),
    trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.waveform_frag );

mode.onChange=updateMode;

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    freqUniform=new CGL.Uniform(shader,'f','uFreq',freq),
    offsetUniform=new CGL.Uniform(shader,'f','uOffset',offset),
    powUniform=new CGL.Uniform(shader,'f','uPow',pow),
    rotateUniform=new CGL.Uniform(shader,'f','uRotate',rotate),

    amountUniform=new CGL.Uniform(shader,'f','amount',amount);

updateMode();

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

function updateMode()
{
    shader.removeDefine("MODE_SAW");
    shader.removeDefine("MODE_SINE");
    shader.removeDefine("MODE_TRI");

    if(mode.get()=='Sine')shader.define("MODE_SINE");
    else if(mode.get()=='Sawtooth')shader.define("MODE_SAW");
    else if(mode.get()=='Triangle')shader.define("MODE_TRI");

}

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
