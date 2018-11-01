const render=op.inTrigger('Render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const animated=op.inValueBool("Animated",true);
const trigger=op.outTrigger("Next");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const timeUniform=new CGL.Uniform(shader,'f','time',1.0);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const srcFrag=attachments.noise_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    if(animated.get()) timeUniform.setValue(op.patch.freeTimer.get()/1000%100);
        else timeUniform.setValue(0);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

