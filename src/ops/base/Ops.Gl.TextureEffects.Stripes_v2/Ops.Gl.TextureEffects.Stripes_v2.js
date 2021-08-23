const
    render=op.inTrigger('Render'),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    num=op.inValue("Num",5),
    width=op.inValue("Width",0.5),
    rotate=op.inValueSlider("Rotate",0),
    offset=op.inValue("Offset",0),
    smoothed=op.inValueBool("Gradients"),
    circular=op.inValueBool("Circular"),
    r=op.inValueSlider("r", Math.random()),
    g=op.inValueSlider("g", Math.random()),
    b=op.inValueSlider("b", Math.random()),
    trigger=op.outTrigger('trigger');

r.setUiAttribs({ colorPick: true });

smoothed.onChange=updateDefines;
circular.onChange=updateDefines;

function updateDefines()
{

    shader.toggleDefine("STRIPES_SMOOTHED",smoothed.get());
    shader.toggleDefine("CIRCULAR",circular.get());
}


const
    cgl=op.patch.cgl,
    shader=new CGL.Shader(cgl,'textureeffect stripes');

shader.setSource(shader.getDefaultVertexShader(),attachments.stripes_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount),
    rotateUniform=new CGL.Uniform(shader,'f','rotate',rotate),
    numUniform=new CGL.Uniform(shader,'f','num',num),
    uniWidth=new CGL.Uniform(shader,'f','width',width),
    uniOffset=new CGL.Uniform(shader,'f','offset',offset),
    uniformR=new CGL.Uniform(shader,'f','r',r),
    uniformG=new CGL.Uniform(shader,'f','g',g),
    uniformB=new CGL.Uniform(shader,'f','b',b);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

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
