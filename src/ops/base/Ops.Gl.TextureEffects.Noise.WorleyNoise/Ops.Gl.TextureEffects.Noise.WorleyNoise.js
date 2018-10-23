var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);

var x=op.inValue("X",0);
var y=op.inValue("Y",0);
var z=op.inValue("Z",0);
var scale=op.inValue("Scale",22);
var inv=op.inValueBool("Invert",true);

var rangeA=op.inValueSlider("RangeA",0.4);
var rangeB=op.inValueSlider("RangeB",0.5);

var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

const srcFrag=(attachments.worleynoise_frag||'').replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(),srcFrag );
const textureUniform=new CGL.Uniform(shader,'t','tex',0);

const uniZ=new CGL.Uniform(shader,'f','z',z);
const uniX=new CGL.Uniform(shader,'f','x',x);
const uniY=new CGL.Uniform(shader,'f','y',y);
const uniScale=new CGL.Uniform(shader,'f','scale',scale);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const rangeAUniform=new CGL.Uniform(shader,'f','rangeA',rangeA);
const rangeBUniform=new CGL.Uniform(shader,'f','rangeB',rangeB);

inv.onChange=updateInvert;
updateInvert();

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};


function updateInvert()
{
    if(inv.get())shader.define("DO_INVERT");
        else shader.removeDefine("DO_INVERT");
}

var tile=op.inValueBool("Tileable",false);
tile.onChange=updateTileable;
function updateTileable()
{
    if(tile.get())shader.define("DO_TILEABLE");
        else shader.removeDefine("DO_TILEABLE");
}

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
