op.name='Pixelate';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var amountX=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE,{  }));
var amountY=op.addInPort(new Port(op,"height",OP_PORT_TYPE_VALUE,{  }));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.pixelate_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var amountXUniform=new CGL.Uniform(shader,'f','amountX',0.0);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',0.0);

amountX.onValueChanged=function()
{
    amountXUniform.setValue(amountX.get());
};

amountY.onValueChanged=function()
{
    amountYUniform.setValue(amountY.get());
};

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

amountX.set(320.0);
amountY.set(180.0);
