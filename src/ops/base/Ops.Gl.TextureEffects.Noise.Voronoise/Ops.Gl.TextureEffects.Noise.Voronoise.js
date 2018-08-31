op.name="Voronoise";

var render=op.inFunction("Render");
var trigger=op.outFunction("Trigger");

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);

var time=op.inValue("Time",0);
var movement=op.inValueSlider("Movement",0);

var num=op.inValue("Num",50);
var seed=op.inValue("seed",0);

var fill=op.inValueSelect("Fill",["None","Random","Gradient","Gray"],"Random");
var drawIsoLines=op.inValueBool("Draw Isolines",false);
var drawDistance=op.inValueBool("Draw Distance",false);
var centerSize=op.inValueSlider("Draw Center",0);


var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);
//op.onLoaded=shader.compile;

var srcFrag=attachments.voronoise_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode);

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

var uniPx=new CGL.Uniform(shader,'f','pX',1/1024);
var uniPy=new CGL.Uniform(shader,'f','pY',1/1024);

var uniFill=new CGL.Uniform(shader,'i','fill',1);
var uniSeed=new CGL.Uniform(shader,'f','seed',seed);
var uniTime=new CGL.Uniform(shader,'f','time',time);
var uniMovement=new CGL.Uniform(shader,'f','movement',movement);
var uniIsoLines=new CGL.Uniform(shader,'b','drawIsoLines',drawIsoLines);
var uniDrawDistance=new CGL.Uniform(shader,'b','drawDistance',drawDistance);
var uniCenterSize=new CGL.Uniform(shader,'f','centerSize',centerSize);

shader.setSource(shader.getDefaultVertexShader(),srcFrag );
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
shader.define("NUM",20.01);

num.onChange=function()
{
    shader.define("NUM",num.get()+0.001);
};

fill.onChange=function()
{
    if(fill.get()=="Random") uniFill.setValue(1);
    else if(fill.get()=="Gradient") uniFill.setValue(2);
    else if(fill.get()=="Gray") uniFill.setValue(3);
    else uniFill.setValue(0);
};

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;


    uniPx.setValue(1/cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniPy.setValue(1/cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    /* --- */cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
