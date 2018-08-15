
var render=op.inFunction("Render");
var trigger=op.outFunction("Trigger");



var amount=op.inValueSlider("amount",1);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;



shader.setSource(shader.getDefaultVertexShader(),attachments.edgeFreiChen_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

var uniWidth=new CGL.Uniform(shader,'f','texWidth',128);
var uniHeight=new CGL.Uniform(shader,'f','texHeight',128);


render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);


    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
