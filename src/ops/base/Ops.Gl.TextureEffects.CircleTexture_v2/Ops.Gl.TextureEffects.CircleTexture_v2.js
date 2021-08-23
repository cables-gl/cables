var render=op.inTrigger("render");
var blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
var amount=op.inValueSlider("Amount",1);
var inSize=op.inValueSlider("size");
var inInner=op.inValueSlider("Inner");
var inStretch=op.inValueSlider("Stretch");

var inX=op.inValue("Pos X",0);
var inY=op.inValue("Pos Y",0);

var fallOff=op.inValueSelect("fallOff",['Linear','SmoothStep'],"Linear");
var inFadeOut=op.inValueSlider("fade Out");
var warnOverflow=op.inValueBool("warn overflow",true);

const r = op.inValueSlider("r", 1);
const g = op.inValueSlider("g", 1);
const b = op.inValueSlider("b", 1);
const a = op.inValueSlider("a", 1);

r.setUiAttribs({ colorPick: true });

op.setPortGroup("Size",[inSize,inInner,inStretch]);
op.setPortGroup("Position",[inX,inY]);
op.setPortGroup("Style",[warnOverflow,fallOff,inFadeOut]);


var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect stripes');
shader.setSource(shader.getDefaultVertexShader(),attachments.circle_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);
var amountUniform=new CGL.Uniform(shader,'f','amount',amount);


var uniStretch=new CGL.Uniform(shader,'f','stretch',inStretch);
var uniSize=new CGL.Uniform(shader,'f','size',inSize);
var uniFadeOut=new CGL.Uniform(shader,'f','fadeOut',inFadeOut);
var uniInner=new CGL.Uniform(shader,'f','inner',inInner);
var aspect=new CGL.Uniform(shader,'f','aspect',1);

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

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

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

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

