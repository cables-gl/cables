const
    render=op.inTrigger('render'),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    pixel=op.inValue("Pixel",5),
    lensDistort=op.inValueSlider("Lens Distort",0),
    doSmooth=op.inValueBool("Smooth",false),
    textureMask=op.inTexture("Mask"),
    trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,"chromatic");

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

shader.setSource(shader.getDefaultVertexShader(),attachments.chromatic_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0),
    uniPixel=new CGL.Uniform(shader,'f','pixel',0),
    uniOnePixel=new CGL.Uniform(shader,'f','onePixel',0),
    unitexMask=new CGL.Uniform(shader,'t','texMask',1),
    uniAmount=new CGL.Uniform(shader,'f','amount',amount),
    unilensDistort=new CGL.Uniform(shader,'f','lensDistort',lensDistort);

doSmooth.onChange=function()
{
    if(doSmooth.get())shader.define("SMOOTH");
    else shader.removeDefine("SMOOTH");
};

textureMask.onChange=function()
{
    if(textureMask.get())shader.define("MASK");
    else shader.removeDefine("MASK");
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniPixel.setValue(pixel.get()*(1/texture.width));
    uniOnePixel.setValue(1/texture.width);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex );

    if(textureMask.get()) cgl.setTexture(1, textureMask.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
