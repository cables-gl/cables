var render=op.inTrigger('Render');

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);
const inBox=op.inValueBool("Square Look",false);
const threshhold=op.inValueSlider("Threshold",0.25);
var radius_low=op.inValueSlider("Radius Low",0);
var radius_high=op.inValueSlider("Radius High",1);
var scale=op.inValue("Scale",10);
var X=op.inValue("X",0);
var Y=op.inValue("Y",0);
var Z=op.inValue("Z",0);
var trigger=op.outTrigger("Next");


var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var amountUniform=new CGL.Uniform(shader,'f','amount',amount);
var timeUniform=new CGL.Uniform(shader,'f','time',1.0);

shader.setSource(shader.getDefaultVertexShader(),attachments.polkadotnoise_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
radius_low.uniform=new CGL.Uniform(shader,'f','radius_low',radius_low);
radius_high.uniform=new CGL.Uniform(shader,'f','radius_high',radius_high);
X.uniform=new CGL.Uniform(shader,'f','X',X);
Y.uniform=new CGL.Uniform(shader,'f','Y',Y);
Z.uniform=new CGL.Uniform(shader,'f','Z',Z);
scale.uniform=new CGL.Uniform(shader,'f','scale',scale);
const uniThreshhold=new CGL.Uniform(shader,'f','threshhold',threshhold);


CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);


inBox.onChange=function()
{
    if(inBox.get())shader.define("BOX");
        else shader.removeDefine("BOX");

};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;


    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );


    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

