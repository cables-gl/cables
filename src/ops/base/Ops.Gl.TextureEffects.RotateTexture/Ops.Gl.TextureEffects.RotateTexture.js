const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const inRotate=op.inValueSlider("Rotate",0.125);
const crop=op.inValueBool("Crop",true);
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

const srcFrag=(attachments.rotate_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const rotateUniform=new CGL.Uniform(shader,'f','rotate',inRotate);

crop.onChange=updateCrop;
updateCrop();

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

function updateCrop()
{
    if(crop.get()==true) shader.define('CROP_IMAGE');
        else shader.removeDefine('CROP_IMAGE');
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
