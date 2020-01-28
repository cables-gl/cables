const render=op.inTrigger('render'),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    inWidth=op.inValueSlider("Width",0.25),
    inHeight=op.inValueSlider("Height",0.25),
    inAspect=op.inBool("Aspect Ratio",false),
    inPosX=op.inValueSlider("X",0.5),
    inPosY=op.inValueSlider("Y",0.5),
    inRot=op.inValue("Rotate",0),
    inRoundness=op.inValueSlider("roundness",0);

const r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a",1.0);
r.setUiAttribs({ colorPick: true });

op.setPortGroup("Size",[inWidth,inHeight,inAspect]);
op.setPortGroup("Position",[inPosX,inPosY]);
op.setPortGroup("Color",[r,g,b,a]);


var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect rectangle');
shader.setSource(shader.getDefaultVertexShader(),attachments.rectangle_frag||'');
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniHeight=new CGL.Uniform(shader,'f','height',inHeight);
var unWidth=new CGL.Uniform(shader,'f','width',inWidth);
var uniX=new CGL.Uniform(shader,'f','x',inPosX);
var uniY=new CGL.Uniform(shader,'f','y',inPosY);
var uniRot=new CGL.Uniform(shader,'f','rotate',inRot);
var uniRoundness=new CGL.Uniform(shader,'f','roundness',inRoundness);

r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);

var uniformR=new CGL.Uniform(shader,'f','r',r);
var uniformG=new CGL.Uniform(shader,'f','g',g);
var uniformB=new CGL.Uniform(shader,'f','b',b);
var uniformA=new CGL.Uniform(shader,'f','a',a);
var uniformAspect=new CGL.Uniform(shader,'f','aspect',1);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);
var uniformAmount=new CGL.Uniform(shader,'f','amount',amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    const texture=cgl.currentTextureEffect.getCurrentSourceTexture();
    if(inAspect.get()) uniformAspect.set(texture.height/texture.width);
    else uniformAspect.set(1);


    cgl.setTexture(0, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};

