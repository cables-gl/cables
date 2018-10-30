var render=op.inTrigger("Render");
var trigger=op.outTrigger("Trigger");

var levels=op.inValue("levels",2);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);


shader.setSource(shader.getDefaultVertexShader(),attachments.posterize_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var levelsUniform=new CGL.Uniform(shader,'f','levels',levels);

var uniWidth=new CGL.Uniform(shader,'f','texWidth',128);
var uniHeight=new CGL.Uniform(shader,'f','texHeight',128);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
