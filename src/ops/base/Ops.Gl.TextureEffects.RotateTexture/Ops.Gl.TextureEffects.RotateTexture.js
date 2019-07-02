const render=op.inTrigger('render'),
    multiplierTex = op.inTexture("Mask"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    inRotate=op.inValueSlider("Rotate",0.125),
    crop=op.inValueBool("Crop",true),
    trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.rotate_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const textureMultiplierUniform=new CGL.Uniform(shader,'t','multiplierTex',1);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const rotateUniform=new CGL.Uniform(shader,'f','rotate',inRotate);

crop.onChange=updateCrop;
updateCrop();


CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

function updateCrop()
{
    shader.toggleDefine('CROP_IMAGE',crop.get());
}
multiplierTex.onChange = function()
{
    shader.toggleDefine('ROTATE_TEXTURE',multiplierTex.isLinked());
}
render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(multiplierTex.get()) cgl.setTexture(1, multiplierTex.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
