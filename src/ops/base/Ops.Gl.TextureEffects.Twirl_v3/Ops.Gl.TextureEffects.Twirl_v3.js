const render=op.inTrigger("Render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    twistAmount=op.inValue("Twist amount",200),
    radius=op.inValue("Radius",0.5),
    centerX=op.inValue("Center X",0.5),
    centerY=op.inValue("Center Y",0.5),
    trigger=op.outTrigger("Next");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.twirl_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    uniTwistAmount=new CGL.Uniform(shader,'f','twistAmount',1),
    uniRadius=new CGL.Uniform(shader,'f','radius',radius),
    unicenterX=new CGL.Uniform(shader,'f','centerX',centerX),
    unicenterY=new CGL.Uniform(shader,'f','centerY',centerY);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniTwistAmount.setValue(twistAmount.get()*(1/texture.width));

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
