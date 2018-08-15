op.name="Clarity";

var render=op.inFunction("Render");
var trigger=op.outFunction("Trigger");
var amount=op.inValueSlider("amount",0.5);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

shader.setSource(shader.getDefaultVertexShader(),attachments.clarity_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

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
