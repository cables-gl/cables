const render=op.inTrigger("render");
const inShader=op.inObject("Shader");
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",0.25);
const trigger=op.outTrigger("trigger")

const cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var textureUniform=null;
var amountUniform=null;

inShader.onChange=function()
{
    shader=inShader.get();
    if(!shader)return;
    var srcFrag=shader.srcFrag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());
    
    shader.setSource(shader.srcVert,srcFrag);
    textureUniform=new CGL.Uniform(shader,'t','tex',0);
    
    amountUniform=new CGL.Uniform(shader,'f','amount',amount);
};



blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};


render.onTriggered=function()
{
    if(!shader)return;
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    if(shader.bindTextures)shader.bindTextures();

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
