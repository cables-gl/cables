var render=op.inTrigger('render');

var amount=op.addInPort(new CABLES.Port(op,"amountX",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var amountY=op.addInPort(new CABLES.Port(op,"amountY",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

var displaceTex=op.inTexture("displaceTex");
var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;

var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.pixeldisplace_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','displaceTex',1);

var amountXUniform=new CGL.Uniform(shader,'f','amountX',amount);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(displaceTex.get())
        cgl.setTexture(1, displaceTex.get().tex );


    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

