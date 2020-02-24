var render=op.inTrigger('render');
var amount=op.inValue("amount");

var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.barreldistort_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniamount=new CGL.Uniform(shader,'f','amount',0);


render.onTriggered=function()
{

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniamount.setValue(amount.get()*(1/texture.width));

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
