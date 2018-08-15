var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var inGradient=op.inTexture("Gradient");

var inPos=op.inValueSlider("Position",0.5);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;


shader.setSource(shader.getDefaultVertexShader(),attachments.colormap_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var textureUniform=new CGL.Uniform(shader,'t','gradient',1);
var uniPos=new CGL.Uniform(shader,'f','pos',inPos);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;
    if(!inGradient.get())return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );


    cgl.gl.activeTexture(cgl.gl.TEXTURE1);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inGradient.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
