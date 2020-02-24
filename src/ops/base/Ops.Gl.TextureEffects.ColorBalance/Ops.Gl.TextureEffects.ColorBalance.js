const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger")
const tone=op.inValueSelect("Tone",["Highlights","Midtones","Shadows"],"Highlights");
const r=op.inValue("r");
const g=op.inValue("g");
const b=op.inValue("b");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.colorbalance_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const uniR=new CGL.Uniform(shader,'f','r',r);
const uniG=new CGL.Uniform(shader,'f','g',g);
const uniB=new CGL.Uniform(shader,'f','b',b);

tone.onChange=function()
{
    shader.removeDefine("TONE_HIGH");
    shader.removeDefine("TONE_MID");
    shader.removeDefine("TONE_LOW");
    if(tone.get()=="Highlights") shader.define("TONE_HIGH");
    if(tone.get()=="Midtones") shader.define("TONE_MID");
    if(tone.get()=="Shadows") shader.define("TONE_LOW");
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
