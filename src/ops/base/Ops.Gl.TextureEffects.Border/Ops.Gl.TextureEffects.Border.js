const render=op.inTrigger('render');
const blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal");
const amount=op.inValueSlider("Amount",1);
const trigger=op.outTrigger('trigger');
const smooth=op.inValueBool("Smooth",false);

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.border_frag);

const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const amountUniform=new CGL.Uniform(shader,'f','amount',amount);
const aspectUniform=new CGL.Uniform(shader,'f','aspect',0);
const uniSmooth=new CGL.Uniform(shader,'b','smoothed',smooth);

const width=op.inValue("width",0.1);
const uniWidth=new CGL.Uniform(shader,'f','width',width.get());

width.onChange=function()
{
    uniWidth.setValue(width.get()/2 );
};

const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
r.setUiAttribs({ colorPick: true });

const unir=new CGL.Uniform(shader,'f','r',r);
const unig=new CGL.Uniform(shader,'f','g',g);
const unib=new CGL.Uniform(shader,'f','b',b);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    var texture=cgl.currentTextureEffect.getCurrentSourceTexture();
    aspectUniform.set(texture.height/texture.width);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
