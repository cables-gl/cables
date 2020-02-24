const
     render=op.inTrigger("Render"),
     blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
     amount=op.inValueSlider("Amount",1),
     trigger=op.outTrigger("Trigger"),
     strength=op.inValueSlider("Strength",1),
     lensRadius1=op.inValueSlider("Radius",0.3),
     sharp=op.inValueSlider("Sharp",0.25),
     aspect=op.inValue("Aspect",1),
     r = op.inValueSlider("r", 0),
     g = op.inValueSlider("g", 0),
     b = op.inValueSlider("b", 0);

r.setUiAttribs({ colorPick: true });

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,'vignette');

shader.setSource(shader.getDefaultVertexShader(),attachments.vignette_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    uniLensRadius1=new CGL.Uniform(shader,'f','lensRadius1',lensRadius1),
    uniaspect=new CGL.Uniform(shader,'f','aspect',aspect),
    unistrength=new CGL.Uniform(shader,'f','strength',strength),
    unisharp=new CGL.Uniform(shader,'f','sharp',sharp),
    unir=new CGL.Uniform(shader,'f','r',r),
    unig=new CGL.Uniform(shader,'f','g',g),
    unib=new CGL.Uniform(shader,'f','b',b);

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
