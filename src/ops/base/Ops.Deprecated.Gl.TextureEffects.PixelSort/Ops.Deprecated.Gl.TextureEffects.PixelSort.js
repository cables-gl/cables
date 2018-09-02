op.name="PixelSort";

var render=op.inFunction("Render");
var trigger=op.outFunction("Trigger");
var amount=op.inValueSlider("amount",0.5);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

shader.setSource(shader.getDefaultVertexShader(),attachments.pixelsort_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var uniPixelSize=new CGL.Uniform(shader,'f','pixelX',1/1024);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();
    
    uniPixelSize.setValue( 1/cgl.currentTextureEffect.getCurrentSourceTexture().width );

    /* --- */cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
