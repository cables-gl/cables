var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var inGradient=op.inTexture("Gradient");

var inPos=op.inValueSlider("Position",0.5);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);



shader.setSource(shader.getDefaultVertexShader(),attachments.colormap_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var textureUniform=new CGL.Uniform(shader,'t','gradient',1);
var uniPos=new CGL.Uniform(shader,'f','pos',inPos);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;
    if(!inGradient.get())return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    


    cgl.setTexture(1, inGradient.get().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inGradient.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
