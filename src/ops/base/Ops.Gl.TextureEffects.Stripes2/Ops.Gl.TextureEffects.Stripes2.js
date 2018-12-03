const
    render=op.inTrigger('Render'),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    num=op.inValue("Num",5),
    width=op.inValue("Width",0.5),
    rotate=op.inValueSlider("Rotate",0),
    offset=op.inValue("Offset",0),
    smoothed=op.inValueBool("Gradients"),
    r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'})),
    g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' })),
    b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' })),
    trigger=op.outTrigger('trigger');

smoothed.onChange=function()
{
    if(smoothed.get())shader.define("STRIPES_SMOOTHED");
        else shader.removeDefine("STRIPES_SMOOTHED");
};

r.set(1.0);
g.set(1.0);
b.set(1.0);

const
    cgl=op.patch.cgl,
    shader=new CGL.Shader(cgl,'textureeffect stripes'),
    srcFrag=(attachments.stripes_frag||'').replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

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
