op.name='Pixelate';

var render=op.inTrigger('render');
var amountX=op.addInPort(new CABLES.Port(op,"width",CABLES.OP_PORT_TYPE_VALUE,{  }));
var amountY=op.addInPort(new CABLES.Port(op,"height",CABLES.OP_PORT_TYPE_VALUE,{  }));
var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.pixelate_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var amountXUniform=new CGL.Uniform(shader,'f','amountX',0.0);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',0.0);

amountX.onChange=function()
{
    amountXUniform.setValue(amountX.get());
};

amountY.onChange=function()
{
    amountYUniform.setValue(amountY.get());
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

amountX.set(320.0);
amountY.set(180.0);
