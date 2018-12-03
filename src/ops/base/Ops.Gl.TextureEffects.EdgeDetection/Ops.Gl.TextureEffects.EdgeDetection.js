var render=op.inTrigger("Render");
var trigger=op.outTrigger("Trigger");

var amount=op.inValueSlider("amount",1);

var mulColor=op.inValueSlider("Mul Color",0);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.edgedetect_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

var uniWidth=new CGL.Uniform(shader,'f','texWidth',128);
var uniHeight=new CGL.Uniform(shader,'f','texHeight',128);
var uniMulColor=new CGL.Uniform(shader,'f','mulColor',mulColor);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};