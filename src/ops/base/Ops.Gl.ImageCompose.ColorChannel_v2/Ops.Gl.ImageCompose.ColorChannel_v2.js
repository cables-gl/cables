const
    render = op.inTrigger("render"),
    channelR = op.inValueBool("channelR", true),
    channelG = op.inValueBool("channelG", false),
    channelB = op.inValueBool("channelB", false),
    channelA = op.inValueBool("channelA", false),
    mono = op.inValueBool("mono", false),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.colorchannel_frag || "");
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

mono.onChange =
    channelA.onChange =
    channelR.onChange =
    channelG.onChange =
    channelB.onChange = updateChannels;
updateChannels();

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

function updateChannels()
{
    shader.toggleDefine("CHANNEL_R", channelR.get());
    shader.toggleDefine("CHANNEL_G", channelG.get());
    shader.toggleDefine("CHANNEL_B", channelB.get());
    shader.toggleDefine("CHANNEL_A", channelA.get());
    shader.toggleDefine("MONO", mono.get());
}
