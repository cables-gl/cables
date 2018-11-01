const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const x=op.inValue("Width",20);
const y=op.inValue("Height",20);
const mul=op.inValue("Mul",1);
const time=op.inValue("Time",1);
const greyscale=op.inValueBool("Greyscale",true);
const trigger=op.outTrigger('trigger');

const srcFrag=attachments.plasma_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
shader.define('GREY');

const uniX=new CGL.Uniform(shader,'f','w',x);
const uniY=new CGL.Uniform(shader,'f','h',y);
const uniTime=new CGL.Uniform(shader,'f','time',time);
const uniMul=new CGL.Uniform(shader,'f','mul',mul);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);

greyscale.onChange=function()
{
    if(greyscale.get())shader.define('GREY');
        else shader.removeDefine('GREY');
};

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

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};
