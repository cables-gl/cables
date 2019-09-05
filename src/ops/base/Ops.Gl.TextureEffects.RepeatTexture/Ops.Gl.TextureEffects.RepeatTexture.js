const render=op.inTrigger("render");
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const amountX=op.inValue("x",3);
const amountY=op.inValue("y",3);
const trigger=op.outTrigger("trigger");
const mulTex=op.inTexture("Multiply");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.repeat_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const textureMulUniform=new CGL.Uniform(shader,'t','mulTex',2);

const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const amountXUniform=new CGL.Uniform(shader,'f','amountX',amountX);
const amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    if(mulTex.get())cgl.setTexture(2, mulTex.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

