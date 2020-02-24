var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');
var strength=op.inValue("Strength",4);
var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

// from: https://forum.openframeworks.cc/t/compute-normal-map-from-image/1400/11

shader.setSource(shader.getDefaultVertexShader(),attachments.tonormal_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniStrength=new CGL.Uniform(shader,'f','strength',strength);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
