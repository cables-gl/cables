const
    render=op.inTrigger("Render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    strength=op.inValueSlider("strength",1),
    iter=op.inInt("iterations",1),
    r = op.inValueSlider("r",1),
    g = op.inValueSlider("g",1),
    b = op.inValueSlider("b",1),
    trigger=op.outTrigger("Trigger");

op.setPortGroup("Look",strength);
r.setUiAttribs({ colorPick: true });
const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.outline_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    strengthUniform=new CGL.Uniform(shader,'f','strength',strength),
    uniWidth=new CGL.Uniform(shader,'f','texWidth',128),
    uniHeight=new CGL.Uniform(shader,'f','texHeight',128),
    unir=new CGL.Uniform(shader,'f','r',r),
    unig=new CGL.Uniform(shader,'f','g',g),
    unib=new CGL.Uniform(shader,'f','b',b);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;


for(var i=0;i<Math.floor(iter.get());i++)
    if(strength.get()>0.0)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

        uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
        uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};