var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var inLut=op.inTexture("LUT Image");

var inAmount=op.inValueSlider("Amount",1.0);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;


shader.setSource(shader.getDefaultVertexShader(),attachments.lut_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var textureUniform=new CGL.Uniform(shader,'t','texLut',1);
var uniPos=new CGL.Uniform(shader,'f','amount',inAmount);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;
    if(!inLut.get())return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.gl.activeTexture(cgl.gl.TEXTURE1);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inLut.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
