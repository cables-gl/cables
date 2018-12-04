const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");

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

var channelR=op.inValueBool("channelR",true);
var channelG=op.inValueBool("channelG",false);
var channelB=op.inValueBool("channelB",false);
var mono=op.inValueBool("mono",false);

mono.onChange=
    channelR.onChange=
    channelG.onChange=
    channelB.onChange=updateChannels;

function updateChannels()
{
    if(channelR.get()) shader.define('CHANNEL_R');
        else shader.removeDefine('CHANNEL_R');

    if(channelG.get())shader.define('CHANNEL_G');
        else shader.removeDefine('CHANNEL_G');

    if(channelB.get()) shader.define('CHANNEL_B');
        else shader.removeDefine('CHANNEL_B');

    if(mono.get()) shader.define('MONO');
        else shader.removeDefine('MONO');
}
