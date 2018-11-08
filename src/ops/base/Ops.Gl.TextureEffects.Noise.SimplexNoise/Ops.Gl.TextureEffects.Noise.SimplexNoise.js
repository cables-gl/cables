const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const smoothness=op.inValue("smoothness",1.0);
const scale=op.inValue("scale",1.0);
const trigger=op.outTrigger('trigger');

const x=op.inValue("x");
const y=op.inValue("y");
const time=op.inValue("time",0.314);

const cgl=op.patch.cgl;

const shader=new CGL.Shader(cgl);

const srcFrag=(attachments.simplexnoise_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);

const uniSmoothness=new CGL.Uniform(shader,'f','smoothness',smoothness.get());
const uniScale=new CGL.Uniform(shader,'f','scale',scale.get());
const uniX=new CGL.Uniform(shader,'f','x',x.get());
const uniY=new CGL.Uniform(shader,'f','y',y.get());
const uniTime=new CGL.Uniform(shader,'f','time',time.get());

x.onChange=function() { uniX.setValue(x.get()/100); };
y.onChange=function(){ uniY.setValue(y.get()/100); };
time.onChange=function(){ uniTime.setValue(time.get()/100); };

smoothness.onChange=function(){ uniSmoothness.setValue(smoothness.get());};
scale.onChange=function(){ uniScale.setValue(scale.get()); };

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

    trigger.trigger();
};
