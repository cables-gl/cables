const render=op.inTrigger("render");
const amount=op.inValueSlider("amount X");
const amountY=op.inValueSlider("amount Y");

const inWrap=op.inValueSelect("Wrap",["Mirror","Clamp","Repeat"],"Mirror");
const inInput=op.inValueSelect("Input",["Luminance","RedGreen","Red","Green","Blue"],"Luminance");

const displaceTex=op.inTexture("displaceTex");
const trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.pixeldisplace3_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const textureDisplaceUniform=new CGL.Uniform(shader,'t','displaceTex',1);

const amountXUniform=new CGL.Uniform(shader,'f','amountX',amount);
const amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);

inWrap.onChange=updateWrap;
inInput.onChange=updateInput;

updateWrap();
updateInput();

function updateWrap()
{
    shader.removeDefine("WRAP_CLAMP");
    shader.removeDefine("WRAP_REPEAT");
    shader.removeDefine("WRAP_MIRROR");
    shader.define("WRAP_"+(inWrap.get()+'').toUpperCase());
}

function updateInput()
{
    shader.removeDefine("INPUT_LUMINANCE");
    shader.removeDefine("INPUT_REDGREEN");
    shader.removeDefine("INPUT_RED");
    shader.define("INPUT_"+(inInput.get()+'').toUpperCase());
}

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(displaceTex.get()) cgl.setTexture(1, displaceTex.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

