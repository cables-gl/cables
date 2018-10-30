const render=op.inFunction("Render");
const trigger=op.outFunction("Trigger");
const amount=op.inValueSlider("amount",0.5);

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.sharpen_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);

const uniPx=new CGL.Uniform(shader,'f','pX',1/1024);
const uniPy=new CGL.Uniform(shader,'f','pY',1/1024);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    uniPx.setValue(1/cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniPy.setValue(1/cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
