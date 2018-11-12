const render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
const trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(),attachments.colorchannel_frag||'');
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

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

var channelR=op.addInPort(new CABLES.Port(op,"channelR",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
channelR.onChange=function()
{
    if(channelR.get()) shader.define('CHANNEL_R');
        else shader.removeDefine('CHANNEL_R');
};
channelR.set(true);

var channelG=op.addInPort(new CABLES.Port(op,"channelG",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
channelG.set(false);
channelG.onChange=function()
{
    if(channelG.get())shader.define('CHANNEL_G');
        else shader.removeDefine('CHANNEL_G');
};


var channelB=op.addInPort(new CABLES.Port(op,"channelB",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
channelB.set(false);
channelB.onChange=function()
{
    if(channelB.get()) shader.define('CHANNEL_B');
        else shader.removeDefine('CHANNEL_B');
};

var mono=op.addInPort(new CABLES.Port(op,"mono",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
mono.set(false);
mono.onChange=function()
{
    if(mono.get()) shader.define('MONO');
        else shader.removeDefine('MONO');
};

