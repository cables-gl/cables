var render=op.inTrigger("render");
var amount=op.inValueSlider('contrast',0.5);
var amountBright=op.inValueSlider('brightness',0.5);

var trigger=op.outTrigger('trigger');
var cgl=op.patch.cgl;

var shader=new CGL.Shader(cgl,'brightnesscontrast');
shader.setSource(shader.getDefaultVertexShader(),attachments.brightness_contrast_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var amountBrightUniform=new CGL.Uniform(shader,'f','amountbright',amountBright);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    if(!cgl.currentTextureEffect.getCurrentSourceTexture()) return;
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};