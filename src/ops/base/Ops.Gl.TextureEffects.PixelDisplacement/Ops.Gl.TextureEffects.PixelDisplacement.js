var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));

var amount=op.addInPort(new CABLES.Port(op,"amountX",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var amountY=op.addInPort(new CABLES.Port(op,"amountY",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

var displaceTex=op.inTexture("displaceTex");
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.pixeldisplace_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var textureDisplaceUniform=new CGL.Uniform(shader,'t','displaceTex',1);

var amountXUniform=new CGL.Uniform(shader,'f','amountX',amount);
var amountYUniform=new CGL.Uniform(shader,'f','amountY',amountY);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(displaceTex.get())
        cgl.setTexture(1, displaceTex.get().tex );


    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

