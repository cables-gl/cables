var render=op.inTrigger("Render");
var amount=op.inValue("Amount");
var radius=op.inValue("Radius");
var centerX=op.inValue("Center X",0.5);
var centerY=op.inValue("Center Y",0.5);
var trigger=op.outTrigger("Next");

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
shader.setSource(shader.getDefaultVertexShader(),attachments.twirl_frag);

var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniamount=new CGL.Uniform(shader,'f','amount',0);
var uniRadius=new CGL.Uniform(shader,'f','radius',radius);
var unicenterX=new CGL.Uniform(shader,'f','centerX',centerX);
var unicenterY=new CGL.Uniform(shader,'f','centerY',centerY);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();

    uniamount.setValue(amount.get()*(1/texture.width));

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
