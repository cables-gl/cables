const render=op.inTrigger('Render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const num=op.inValue("Num",5);
const width=op.inValue("Width",0.5);

const rotate=op.inValueSlider("Rotate",0);
const offset=op.inValue("Offset",0);

const smoothed=op.inValueBool("Gradients");

const r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
const g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
const b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
const a=op.addInPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

const trigger=op.outTrigger('trigger');

smoothed.onChange=function()
{
    if(smoothed.get())shader.define("STRIPES_SMOOTHED");
    else shader.removeDefine("STRIPES_SMOOTHED");
};

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,'textureeffect stripes');

const srcFrag=(attachments.stripes_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());
shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const rotateUniform=new CGL.Uniform(shader,'f','rotate',rotate);

const numUniform=new CGL.Uniform(shader,'f','num',num);
const uniWidth=new CGL.Uniform(shader,'f','width',width);

const uniOffset=new CGL.Uniform(shader,'f','offset',offset);

r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);


var uniformR=new CGL.Uniform(shader,'f','r',r);
var uniformG=new CGL.Uniform(shader,'f','g',g);
var uniformB=new CGL.Uniform(shader,'f','b',b);
var uniformA=new CGL.Uniform(shader,'f','a',a);

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
