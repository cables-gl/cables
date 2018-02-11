
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var hue=op.addInPort(new Port(op,"hue",OP_PORT_TYPE_VALUE,{display:'range'}));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

hue.set(1.0);
var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.hue_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniformHue=new CGL.Uniform(shader,'f','hue',1.0);

hue.onValueChanged=function(){ uniformHue.setValue(hue.get()); };

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
