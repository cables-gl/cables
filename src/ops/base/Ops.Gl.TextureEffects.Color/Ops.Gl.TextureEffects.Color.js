var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect color');

op.onLoaded=shader.compile;

var srcFrag=attachments.color_frag;

srcFrag=srcFrag.replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
r.set(1.0);
g.set(1.0);
b.set(1.0);

var uniformR=new CGL.Uniform(shader,'f','r',r);
var uniformG=new CGL.Uniform(shader,'f','g',g);
var uniformB=new CGL.Uniform(shader,'f','b',b);
var uniformAmount=new CGL.Uniform(shader,'f','amount',amount);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
