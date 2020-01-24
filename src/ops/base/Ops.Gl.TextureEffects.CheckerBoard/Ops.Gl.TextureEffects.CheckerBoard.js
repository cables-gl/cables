const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const lineSize=op.inValue("Size",10);
const inRotate=op.inValueSlider("Rotate",0.0);
const inCentered=op.inBool("Centered",false);

const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.checkerboard_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const uniLineSize=new CGL.Uniform(shader,'f','lineSize',lineSize);
const rotateUniform=new CGL.Uniform(shader,'f','rotate',inRotate);
const centeredUniform=new CGL.Uniform(shader,'b','center',inCentered);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

inCentered.onChange=function()
{
    shader.toggleDefine('CENTER',inCentered.get());
}
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
