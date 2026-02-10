const
    render = op.inTrigger("render"),
    channelR = op.inSwitch("ChannelR", ["0", "1", "R", "G", "B", "A"], "R"),
    channelG = op.inSwitch("ChannelG", ["0", "1", "R", "G", "B", "A"], "G"),
    channelB = op.inSwitch("ChannelB", ["0", "1", "R", "G", "B", "A"], "B"),
    channelA = op.inSwitch("ChannelA", ["0", "1", "R", "G", "B", "A"], "A"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.colorchannel_frag || "");
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

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
    shader.toggleDefine("CHANNEL_R_0", channelR.get() == "0");
    shader.toggleDefine("CHANNEL_R_1", channelR.get() == "1");
    shader.toggleDefine("CHANNEL_R_R", channelR.get() == "R");
    shader.toggleDefine("CHANNEL_R_G", channelR.get() == "G");
    shader.toggleDefine("CHANNEL_R_B", channelR.get() == "B");
    shader.toggleDefine("CHANNEL_R_A", channelR.get() == "A");

    shader.toggleDefine("CHANNEL_G_0", channelG.get() == "0");
    shader.toggleDefine("CHANNEL_G_1", channelG.get() == "1");
    shader.toggleDefine("CHANNEL_G_R", channelG.get() == "R");
    shader.toggleDefine("CHANNEL_G_G", channelG.get() == "G");
    shader.toggleDefine("CHANNEL_G_B", channelG.get() == "B");
    shader.toggleDefine("CHANNEL_G_A", channelG.get() == "A");

    shader.toggleDefine("CHANNEL_B_0", channelB.get() == "0");
    shader.toggleDefine("CHANNEL_B_1", channelB.get() == "1");
    shader.toggleDefine("CHANNEL_B_R", channelB.get() == "R");
    shader.toggleDefine("CHANNEL_B_G", channelB.get() == "G");
    shader.toggleDefine("CHANNEL_B_B", channelB.get() == "B");
    shader.toggleDefine("CHANNEL_B_A", channelB.get() == "A");

    shader.toggleDefine("CHANNEL_A_0", channelA.get() == "0");
    shader.toggleDefine("CHANNEL_A_1", channelA.get() == "1");
    shader.toggleDefine("CHANNEL_A_R", channelA.get() == "R");
    shader.toggleDefine("CHANNEL_A_G", channelA.get() == "G");
    shader.toggleDefine("CHANNEL_A_B", channelA.get() == "B");
    shader.toggleDefine("CHANNEL_A_A", channelA.get() == "A");
}
