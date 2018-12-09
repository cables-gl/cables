const
    render=op.inTrigger('render'),
    trigger=op.outTrigger('trigger'),
    axis=op.inValueFloat("axis"),
    width=op.inValueFloat("width",0.5),
    offset=op.inValueFloat("offset"),
    flip=op.inValueBool("flip");

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.mirror_frag);

const
    textureUniform=new CGL.Uniform(shader,'t','tex',0),
    uniAxis=new CGL.Uniform(shader,'f','axis',0),
    uniWidth=new CGL.Uniform(shader,'f','width',width),
    uniOffset=new CGL.Uniform(shader,'f','offset',offset),
    uniFlip=new CGL.Uniform(shader,'f','flip',0);

flip.onChange=function()
{
    if(flip.get())uniFlip.setValue(1);
        else uniFlip.setValue(0);
};

axis.onChange=function()
{
    if(axis.get()=='X')uniAxis.setValue(0);
        else if(axis.get()=='Y')uniAxis.setValue(1);
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
