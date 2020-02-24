op.name="RectangularNoise";

var render=op.inTrigger('render');


var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);

var threshold=op.inValueSlider("Threshold",0.35);

var x=op.inValue("X",0);
var y=op.inValue("Y",0);
var z=op.inValue("Z",0);
var scale=op.inValue("Scale",22);





var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

var srcFrag=attachments.movingrectnoise_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(),srcFrag );
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniZ=new CGL.Uniform(shader,'f','z',z);
var uniX=new CGL.Uniform(shader,'f','x',x);
var uniY=new CGL.Uniform(shader,'f','y',y);
var uniScale=new CGL.Uniform(shader,'f','scale',scale);
var uniThreshold=new CGL.Uniform(shader,'f','threshold',threshold);

var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0,cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
