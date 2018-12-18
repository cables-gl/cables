const render=op.inTrigger('render');
const pixel=op.inValue("Pixel",5);
const lensDistort=op.inValueSlider("Lens Distort",0);
const textureMask=op.inTexture("Mask");
const doSmooth=op.inValueBool("Smooth",false);
const trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

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

shader.setSource(shader.getDefaultVertexShader(),attachments.chromatic_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniPixel=new CGL.Uniform(shader,'f','pixel',0);
var uniOnePixel=new CGL.Uniform(shader,'f','onePixel',0);
var unitexMask=new CGL.Uniform(shader,'t','texMask',1);
var unilensDistort=new CGL.Uniform(shader,'f','lensDistort',lensDistort);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniPixel.setValue(pixel.get()*(1/texture.width));
    uniOnePixel.setValue(1/texture.width);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex );

    if(textureMask.get()) cgl.setTexture(1, textureMask.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
