const
    render=op.inTrigger('render'),
    trigger=op.outTrigger('trigger'),
    inInvert=op.inValueBool("Invert"),
    inBlackWhite=op.inValueBool("Black White"),
    threshold=op.inValueSlider("amthresholdount",0.5);

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.lumakey_frag);
const textureUniform=new CGL.Uniform(shader,'t','tex',0);
const unThreshold=new CGL.Uniform(shader,'f','threshhold',threshold);

inBlackWhite.onChange=function()
{
    if(inInvert.get()) shader.define('BLACKWHITE');
        else shader.removeDefine('BLACKWHITE');
};

inInvert.onChange=function()
{
    if(inInvert.get()) shader.define('INVERT');
        else shader.removeDefine('INVERT');
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
