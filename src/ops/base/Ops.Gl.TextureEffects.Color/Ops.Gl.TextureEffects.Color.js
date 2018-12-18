const
    render=op.inTrigger("render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    inMask=op.inTexture("Mask"),
    r=op.inValueSlider("r",Math.random()),
    g=op.inValueSlider("g",Math.random()),
    b=op.inValueSlider("b",Math.random()),
    trigger=op.outTrigger("trigger");

r.setUiAttribs({colorPick:true});

op.setPortGroup('Blending',[blendMode,amount]);
op.setPortGroup('Color',[r,g,b]);

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

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

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
