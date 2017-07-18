op.name="FBMNoise";


var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);


var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var srcFrag=attachments.fbmnoise_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(),srcFrag );
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

new CGL.Uniform(shader,'f','scale',op.inValue("scale",2));
new CGL.Uniform(shader,'f','anim',op.inValue("anim",0));
new CGL.Uniform(shader,'f','scrollX',op.inValue("scrollX",9));
new CGL.Uniform(shader,'f','scrollY',op.inValue("scrollY",0));
new CGL.Uniform(shader,'f','repeat',op.inValue("repeat",1));

new CGL.Uniform(shader,'b','layer1',op.inValueBool("Layer 1",true));
new CGL.Uniform(shader,'b','layer2',op.inValueBool("Layer 2",true));
new CGL.Uniform(shader,'b','layer3',op.inValueBool("Layer 3",true));
new CGL.Uniform(shader,'b','layer4',op.inValueBool("Layer 4",true));


var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
