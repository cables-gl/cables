const
    render=op.inTrigger('render'),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    x=op.inValue("Width",20),
    y=op.inValue("Height",20),
    mul=op.inValue("Mul",1),
    offsetX=op.inValue("offset X",0),
    offsetY=op.inValue("offset Y",0),
    time=op.inValue("Time",1),
    greyscale=op.inValueBool("Greyscale",true),
    trigger=op.outTrigger('trigger');


const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.plasma_frag);
shader.define('GREY');

const
    uniX=new CGL.Uniform(shader,'f','w',x),
    uniY=new CGL.Uniform(shader,'f','h',y),
    uniTime=new CGL.Uniform(shader,'f','time',time),
    uniMul=new CGL.Uniform(shader,'f','mul',mul),
    unioffsetX=new CGL.Uniform(shader,'f','offsetX',offsetX),
    unioffsetY=new CGL.Uniform(shader,'f','offsetY',offsetY),
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount);

greyscale.onChange=function()
{
    if(greyscale.get())shader.define('GREY');
        else shader.removeDefine('GREY');
};

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

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
