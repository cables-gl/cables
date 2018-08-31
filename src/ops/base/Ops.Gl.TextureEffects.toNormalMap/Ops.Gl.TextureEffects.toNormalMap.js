op.name="toNormalMap";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var strength=op.inValue("Strength",4);
var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

// from: https://forum.openframeworks.cc/t/compute-normal-map-from-image/1400/11

shader.setSource(shader.getDefaultVertexShader(),attachments.tonormal_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniStrength=new CGL.Uniform(shader,'f','strength',strength);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
