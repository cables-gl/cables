var render=op.inTrigger("render");

var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);
var inSize=op.addInPort(new CABLES.Port(op,"size",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
var inInner=op.addInPort(new CABLES.Port(op,"Inner",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
var inX=op.inValue("Pos X",0.5);
var inY=op.inValue("Pos Y",0.5);
var inFadeOut=op.addInPort(new CABLES.Port(op,"fade Out",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
var warnOverflow=op.inValueBool("warn overflow",true);
var fallOff=op.inValueSelect("fallOff",['Linear','SmoothStep'],"Linear");

var r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'}));
var g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

var trigger=op.outTrigger('trigger');
var srcFrag=attachments.circle_frag.replace('{{BLENDCODE}}',CGL.TextureEffect.getBlendCode());

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect stripes');
shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);

var uniSize=new CGL.Uniform(shader,'f','size',inSize);
var uniFadeOut=new CGL.Uniform(shader,'f','fadeOut',inFadeOut);
var uniInner=new CGL.Uniform(shader,'f','inner',inInner);
var aspect=new CGL.Uniform(shader,'f','aspect',1);

r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);

inSize.set(0.25);

setFallOf();
setWarnOverflow();

var uniformR=new CGL.Uniform(shader,'f','r',r);
var uniformG=new CGL.Uniform(shader,'f','g',g);
var uniformB=new CGL.Uniform(shader,'f','b',b);
var uniformA=new CGL.Uniform(shader,'f','a',a);

var uniformX=new CGL.Uniform(shader,'f','x',inX);
var uniformY=new CGL.Uniform(shader,'f','y',inY);

fallOff.onChange=setFallOf;
warnOverflow.onChange=setWarnOverflow;

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

function setFallOf()
{
    shader.removeDefine('FALLOFF_LINEAR');
    shader.removeDefine('FALLOFF_SMOOTHSTEP');

    if(fallOff.get()=='Linear') shader.define('FALLOFF_LINEAR');
    if(fallOff.get()=='SmoothStep') shader.define('FALLOFF_SMOOTHSTEP');
}

function setWarnOverflow()
{
    if(warnOverflow.get()) shader.define('WARN_OVERFLOW');
        else shader.removeDefine('WARN_OVERFLOW');
}

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var a=cgl.currentTextureEffect.getCurrentSourceTexture().height/cgl.currentTextureEffect.getCurrentSourceTexture().width;
    aspect.set(a);

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

