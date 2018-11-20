const
    render=op.inTrigger("render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    inMask=op.inTexture("Mask"),
    r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true'})),
    g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' })),
    b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' })),
    trigger=op.outTrigger("trigger");

r.set(1.0);
g.set(1.0);
b.set(1.0);

const TEX_SLOT=0;
const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,'textureeffect color');

var srcFrag=attachments.color_frag||'';
srcFrag=srcFrag.replace("{{BLENDCODE}}",CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(),srcFrag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',TEX_SLOT),
    makstextureUniform=new CGL.Uniform(shader,'t','mask',1),
    uniformR=new CGL.Uniform(shader,'f','r',r),
    uniformG=new CGL.Uniform(shader,'f','g',g),
    uniformB=new CGL.Uniform(shader,'f','b',b),
    uniformAmount=new CGL.Uniform(shader,'f','amount',amount);

inMask.onChange=function()
{
    if(inMask.get())shader.define("MASK");
        else shader.removeDefine("MASK");
};

blendMode.onChange=function()
{
    CGL.TextureEffect.onChangeBlendSelect(shader,blendMode.get());
};

render.onTriggered=function()
{
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(TEX_SLOT, cgl.currentTextureEffect.getCurrentSourceTexture().tex );
    if(inMask.get()) cgl.setTexture(1, inMask.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
