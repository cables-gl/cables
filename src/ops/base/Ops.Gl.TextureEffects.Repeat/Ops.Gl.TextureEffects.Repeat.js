const render=op.inTrigger("render");
const amountX=op.inValue("x",3);
const amountY=op.inValue("y",3);
const trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.repeat_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountXUniform=new CGL.Uniform(shader,'f','amountX',amountX);
const amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);

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

