const
    render=op.inTrigger("render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    r=op.inValueSlider("r",1.0),
    g=op.inValueSlider("g",1.0),
    b=op.inValueSlider("b",1.0),
    trigger=op.outTrigger("trigger");

r.setUiAttribs({colorPick:true});

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.fbmnoise_frag);
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

const uniColor=new CGL.Uniform(shader,'3f','color',r,g,b);

var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

var tile=op.inValueBool("Tileable",false);
tile.onChange=updateTileable;
function updateTileable()
{
    if(tile.get())shader.define("DO_TILEABLE");
        else shader.removeDefine("DO_TILEABLE");
}

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniAspect.set( cgl.currentTextureEffect.getCurrentSourceTexture().width / cgl.currentTextureEffect.getCurrentSourceTexture().height );

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
