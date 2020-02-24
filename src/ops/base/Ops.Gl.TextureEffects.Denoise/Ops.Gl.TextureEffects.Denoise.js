var render=op.inTrigger('render');
var strength=op.inValueSlider("Exponent",0.6);

var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
var tsize=[128,128];
var srcFrag=attachments.denoise_frag;

shader.setSource(shader.getDefaultVertexShader(),srcFrag );
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var strengthUniform=new CGL.Uniform(shader,'f','exponent',strength);
var texSizeUniform=new CGL.Uniform(shader,'2f','texSize',tsize);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    tsize[0]=cgl.currentTextureEffect.getCurrentSourceTexture().width;
    tsize[1]=cgl.currentTextureEffect.getCurrentSourceTexture().height;
    texSizeUniform.setValue(tsize);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
