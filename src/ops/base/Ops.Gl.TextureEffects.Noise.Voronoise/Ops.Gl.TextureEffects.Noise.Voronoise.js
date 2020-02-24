const
    render=op.inTrigger("Render"),
    trigger=op.outTrigger("Trigger"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    time=op.inValue("Time",0),
    movement=op.inValueSlider("Movement",0),
    num=op.inValue("Num",50),
    seed=op.inValue("seed",0),
    fill=op.inValueSelect("Fill",["None","Random","Gradient","Gray"],"Random"),
    drawIsoLines=op.inValueBool("Draw Isolines",false),
    drawDistance=op.inValueBool("Draw Distance",false),
    centerSize=op.inValueSlider("Draw Center",0);

const cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.voronoise_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    uniPx=new CGL.Uniform(shader,'f','pX',1/1024),
    uniPy=new CGL.Uniform(shader,'f','pY',1/1024),
    uniFill=new CGL.Uniform(shader,'i','fill',1),
    uniSeed=new CGL.Uniform(shader,'f','seed',seed),
    uniTime=new CGL.Uniform(shader,'f','time',time),
    uniMovement=new CGL.Uniform(shader,'f','movement',movement),
    uniIsoLines=new CGL.Uniform(shader,'b','drawIsoLines',drawIsoLines),
    uniDrawDistance=new CGL.Uniform(shader,'b','drawDistance',drawDistance),
    uniCenterSize=new CGL.Uniform(shader,'f','centerSize',centerSize);

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

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;


    uniPx.setValue(1/cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniPy.setValue(1/cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );


    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
