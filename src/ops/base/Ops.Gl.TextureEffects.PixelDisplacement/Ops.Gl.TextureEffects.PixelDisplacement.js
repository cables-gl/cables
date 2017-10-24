op.name='PixelDisplacement';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var amount=op.addInPort(new Port(op,"amountX",OP_PORT_TYPE_VALUE,{ display:'range' }));
var amountY=op.addInPort(new Port(op,"amountY",OP_PORT_TYPE_VALUE,{ display:'range' }));

var displaceTex=op.inTexture("displaceTex");
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));


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

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(displaceTex.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, displaceTex.get().tex );
    }

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

