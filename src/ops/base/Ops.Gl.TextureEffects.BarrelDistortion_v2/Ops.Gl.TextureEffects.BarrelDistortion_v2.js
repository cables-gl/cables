const
    render=op.inTrigger('render'),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount = op.inValueSlider("Amount",1.0),
    intensity=op.inValue("Intensity",10.),
    trigger=op.outTrigger('Trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.barreldistort_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    uniintensity=new CGL.Uniform(shader,'f','intensity',0),
    amountUniform = new CGL.Uniform(shader,'f','amount',amount);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;
    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniintensity.setValue(intensity.get()*(1/texture.width));

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
