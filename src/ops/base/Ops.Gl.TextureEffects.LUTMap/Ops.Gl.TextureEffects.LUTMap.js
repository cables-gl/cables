var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

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

    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    /* --- */cgl.setTexture(1, inLut.get().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inLut.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
