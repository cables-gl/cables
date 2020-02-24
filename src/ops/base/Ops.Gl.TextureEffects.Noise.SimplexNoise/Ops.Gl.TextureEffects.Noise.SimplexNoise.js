const
    render=op.inTrigger('render'),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    smoothness=op.inValue("smoothness",1.0),
    scale=op.inValue("scale",1.0),
    trigger=op.outTrigger('trigger'),
    x=op.inValue("x"),
    y=op.inValue("y"),
    time=op.inValue("time",0.314);

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.simplexnoise_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    uniSmoothness=new CGL.Uniform(shader,'f','smoothness',smoothness),
    uniScale=new CGL.Uniform(shader,'f','scale',scale),
    uniX=new CGL.Uniform(shader,'f','x',x),
    uniY=new CGL.Uniform(shader,'f','y',y),
    uniTime=new CGL.Uniform(shader,'f','time',time);


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
