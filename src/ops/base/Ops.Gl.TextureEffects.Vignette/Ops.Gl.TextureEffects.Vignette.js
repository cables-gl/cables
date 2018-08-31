op.name='Vignette';

var render=op.inFunction("render");
var trigger=op.outFunction("trigger");

var amount=op.inValueSlider("Amount",1);
var lensRadius1=op.inValue("lensRadius1",0.8);
var lensRadius2=op.inValue("lensRadius2",0.4);
var ratio=op.inValue("Ratio",1);

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);


shader.setSource(shader.getDefaultVertexShader(),attachments.vignette_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var uniLensRadius1=new CGL.Uniform(shader,'f','lensRadius1',lensRadius1);
var uniLensRadius2=new CGL.Uniform(shader,'f','lensRadius2',lensRadius2);
var uniRatio=new CGL.Uniform(shader,'f','ratio',ratio);
var uniAmount=new CGL.Uniform(shader,'f','amount',amount);


render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
