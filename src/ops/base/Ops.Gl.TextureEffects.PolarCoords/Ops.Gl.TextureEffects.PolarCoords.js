const
    render=op.inTrigger("render"),
    inner=op.inValueSlider("Radius Inner",0),
    outer=op.inValueSlider("Radius Outer",1),
    crop=op.inValueBool("Crop",false),
    trigger=op.outTrigger('trigger'),
    cgl=op.patch.cgl;

const shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),attachments.polarcoords_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    uniinner=new CGL.Uniform(shader,'f','inner',inner),
    uniouter=new CGL.Uniform(shader,'f','outer',outer);

crop.onChange=updateCrop;

function updateCrop()
{
    if(crop.get()) shader.define('CROP_IMAGE');
        else shader.removeDefine('CROP_IMAGE');
}

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};