op.name="Sharpen";

var render=op.inFunction("Render");
var trigger=op.outFunction("Trigger");
var amount=op.inValueSlider("amount",0.5);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

shader.setSource(shader.getDefaultVertexShader(),attachments.sharpen_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

var uniPx=new CGL.Uniform(shader,'f','pX',1/1024);
var uniPy=new CGL.Uniform(shader,'f','pY',1/1024);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    uniPx.setValue(1/cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniPy.setValue(1/cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
