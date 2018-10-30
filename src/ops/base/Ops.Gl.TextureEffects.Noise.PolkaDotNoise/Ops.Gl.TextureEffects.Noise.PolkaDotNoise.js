var render=op.inTrigger('render');

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);

var radius_low=op.inValueSlider("Radius Low",0);
var radius_high=op.inValueSlider("Radius High",1);
var scale=op.inValue("Scale",10);

var X=op.inValue("X",0);
var Y=op.inValue("Y",0);

var Z=op.inValue("Z",0);

var trigger=op.addOutPort(new CABLES.Port(op,"Next",CABLES.OP_PORT_TYPE_FUNCTION));


var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var timeUniform=new CGL.Uniform(shader,'f','time',1.0);

var srcFrag=attachments.polkadotnoise_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());



shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
radius_low.uniform==new CGL.Uniform(shader,'f','radius_low',radius_low);
radius_high.uniform==new CGL.Uniform(shader,'f','radius_high',radius_high);
X.uniform==new CGL.Uniform(shader,'f','X',X);
Y.uniform==new CGL.Uniform(shader,'f','Y',Y);
Z.uniform==new CGL.Uniform(shader,'f','Z',Z);
scale.uniform==new CGL.Uniform(shader,'f','scale',scale);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;


    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

