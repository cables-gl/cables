op.name="ChromaticAberration";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var pixel=op.inValue("Pixel",5);
var lensDistort=op.inValueSlider("Lens Distort",0);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);


shader.setSource(shader.getDefaultVertexShader(),attachments.chromatic_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniPixel=new CGL.Uniform(shader,'f','pixel',0);
var uniOnePixel=new CGL.Uniform(shader,'f','onePixel',0);

var unilensDistort=new CGL.Uniform(shader,'f','lensDistort',lensDistort);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniPixel.setValue(pixel.get()*(1/texture.width));
    uniOnePixel.setValue(1/texture.width);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
