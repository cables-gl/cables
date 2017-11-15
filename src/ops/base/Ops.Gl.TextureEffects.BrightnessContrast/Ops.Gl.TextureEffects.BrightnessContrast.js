var cgl=op.patch.cgl;

op.name='BrightnessContrast';

var render=op.inFunction("render");
var amount=op.inValueSlider('contrast');
var amountBright=op.inValueSlider('brightness');

var trigger=op.outFunction('trigger');

var shader=new CGL.Shader(cgl);

amountBright.set(0.5);
amount.set(0.5);

shader.setSource(shader.getDefaultVertexShader(),attachments.brightness_contrast_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var amountBrightUniform=new CGL.Uniform(shader,'f','amountbright',amountBright);


render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};