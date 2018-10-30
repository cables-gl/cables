var render=op.inTrigger("render");

var inner=op.inValueSlider("Radius Inner",0.25);
var outer=op.inValueSlider("Radius Outer",0.5);

var trigger=op.outTrigger('trigger');
var cgl=op.patch.cgl;

var shader=new CGL.Shader(cgl);


shader.setSource(shader.getDefaultVertexShader(),attachments.polarcoords_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var inner=new CGL.Uniform(shader,'f','inner',inner);
var outer=new CGL.Uniform(shader,'f','outer',outer);


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