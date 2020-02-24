op.name="PixelSort";

var render=op.inTrigger("Render");
var trigger=op.outTrigger("Trigger");
var amount=op.inValueSlider("amount",0.5);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);


shader.setSource(shader.getDefaultVertexShader(),attachments.pixelsort_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var uniPixelSize=new CGL.Uniform(shader,'f','pixelX',1/1024);

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();
    
    uniPixelSize.setValue( 1/cgl.currentTextureEffect.getCurrentSourceTexture().width );

    cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
