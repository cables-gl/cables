var render=op.inFunction("render");
var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var time=op.inValueSlider('animate',0.5);
var inFrequency=op.inValueSlider('frequency',12.0);
var inStrength=op.inValueSlider('strength',12.0);
var inBlockSizeA=op.inValueSlider('Block size small x',24.0);
var inBlockSizeB=op.inValueSlider('Block size small y',9.0);
var inBlockSizeC=op.inValueSlider('Block size large x',8.0);
var inBlockSizeD=op.inValueSlider('Block size large y',4.0);

var trigger=op.outFunction('trigger');
var cgl=op.patch.cgl;

var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.interference_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var timeUniform=new CGL.Uniform(shader,'f','time',time);
var timeUniform=new CGL.Uniform(shader,'f','frequency',inFrequency);
var strengthUniform=new CGL.Uniform(shader,'f','strength',inStrength);

var sizeAUniform=new CGL.Uniform(shader,'f','blockSizeA',inBlockSizeA);
var sizeBUniform=new CGL.Uniform(shader,'f','blockSizeB',inBlockSizeB);
var sizeCUniform=new CGL.Uniform(shader,'f','blockSizeC',inBlockSizeC);
var sizeDUniform=new CGL.Uniform(shader,'f','blockSizeD',inBlockSizeD);


blendMode.onValueChanged=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

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