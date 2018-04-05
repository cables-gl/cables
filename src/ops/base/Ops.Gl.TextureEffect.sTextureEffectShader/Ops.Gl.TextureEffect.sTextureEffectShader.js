op.name="ShaderEffect";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var inShader=op.inObject("Shader");

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",0.25);


var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
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
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();



    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

if(shader.bindTextures)shader.bindTextures();

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
