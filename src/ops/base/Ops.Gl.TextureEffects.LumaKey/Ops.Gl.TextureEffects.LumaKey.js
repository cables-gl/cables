const render=op.inTrigger('render');
const trigger=op.outTrigger('trigger');
const inInvert=op.inValueBool("Invert");
const inBlackWhite=op.inValueBool("Black White");

const cgl=op.patch.cgl;

var threshold=op.addInPort(new CABLES.Port(op,"amthresholdount",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
threshold.set(0.5);

var shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.lumakey_frag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var unThreshold=new CGL.Uniform(shader,'f','threshhold',threshold);

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
