const
    render=op.inTrigger("render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1),
    scale=op.inValue("Scale",22),
    x=op.inValue("X",0),
    y=op.inValue("Y",0),
    z=op.inValue("Z",0),
    trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,'perlinnoise');

op.setPortGroup("Position",[x,y,z]);

shader.setSource(shader.getDefaultVertexShader(),attachments.perlinnoise3d_frag );

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    uniZ=new CGL.Uniform(shader,'f','z',z),
    uniX=new CGL.Uniform(shader,'f','x',x),
    uniY=new CGL.Uniform(shader,'f','y',y),
    uniScale=new CGL.Uniform(shader,'f','scale',scale),
    amountUniform=new CGL.Uniform(shader,'f','amount',amount);

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
