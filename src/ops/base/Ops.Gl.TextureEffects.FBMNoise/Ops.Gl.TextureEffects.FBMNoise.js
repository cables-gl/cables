var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var srcFrag=attachments.fbmnoise_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(),srcFrag );
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniScale=new CGL.Uniform(shader,'f','scale',op.inValue("scale",2));
var uniAnim=new CGL.Uniform(shader,'f','anim',op.inValue("anim",0));
var uniScrollX=new CGL.Uniform(shader,'f','scrollX',op.inValue("scrollX",9));
var uniScrollY=new CGL.Uniform(shader,'f','scrollY',op.inValue("scrollY",0));
var uniRepeat=new CGL.Uniform(shader,'f','repeat',op.inValue("repeat",1));
var uniAspect=new CGL.Uniform(shader,'f','aspect',op.inValue("aspect",1));

var uniLayer1=new CGL.Uniform(shader,'b','layer1',op.inValueBool("Layer 1",true));
var uniLayer2=new CGL.Uniform(shader,'b','layer2',op.inValueBool("Layer 2",true));
var uniLayer3=new CGL.Uniform(shader,'b','layer3',op.inValueBool("Layer 3",true));
var uniLayer4=new CGL.Uniform(shader,'b','layer4',op.inValueBool("Layer 4",true));

var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

var tile=op.inValueBool("Tileable",false);
tile.onChange=updateTileable;
function updateTileable()
{
    if(tile.get())shader.define("DO_TILEABLE");
        else shader.removeDefine("DO_TILEABLE");
}


blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    uniAspect.set( cgl.currentTextureEffect.getCurrentSourceTexture().width / cgl.currentTextureEffect.getCurrentSourceTexture().height );

    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
