var render=op.inTrigger('render');

var inWidth=op.inValueFloat("Width");
var inHeight=op.inValueFloat("Height");
var inPosX=op.inValueFloat("X");
var inPosY=op.inValueFloat("Y");

const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
const a = op.inValueSlider("a",1.0);
r.setUiAttribs({ colorPick: true });

var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var shader=new CGL.Shader(cgl,'textureeffect rectangle');
shader.setSource(shader.getDefaultVertexShader(),attachments.rectangle_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniHeight=new CGL.Uniform(shader,'f','height',0);
var unWidth=new CGL.Uniform(shader,'f','width',0);
var uniX=new CGL.Uniform(shader,'f','x',0);
var uniY=new CGL.Uniform(shader,'f','y',0);

r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);
inWidth.set(0.25);
inHeight.set(0.25);

var uniformR=new CGL.Uniform(shader,'f','r',r);
var uniformG=new CGL.Uniform(shader,'f','g',g);
var uniformB=new CGL.Uniform(shader,'f','b',b);
var uniformA=new CGL.Uniform(shader,'f','a',a);



render.onTriggered=function()
{
    var w=inWidth.get();
    var h=inHeight.get();
    var x=inPosX.get();
    var y=inPosY.get();

    if(w<0)
    {
        x+=w;
        w*=-1;
    }
    if(h<0)
    {
        y+=h;
        h*=-1;
    }

    uniX.set(x);
    uniY.set(y);
    uniHeight.set(h);
    unWidth.set(w);

    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex );


    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

