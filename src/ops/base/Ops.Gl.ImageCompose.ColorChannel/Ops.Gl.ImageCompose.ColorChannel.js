const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.colorchannel_frag || "");
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

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

let channelR = op.inValueBool("channelR", true);
let channelG = op.inValueBool("channelG", false);
let channelB = op.inValueBool("channelB", false);
let mono = op.inValueBool("mono", false);
let alpha = op.inValueBool("Alpha", false);

mono.onChange =
    alpha.onChange =
    channelR.onChange =
    channelG.onChange =
    channelB.onChange = updateChannels;
updateChannels();

function updateChannels()
{
    if (channelR.get()) shader.define("CHANNEL_R");
    else shader.removeDefine("CHANNEL_R");

    if (channelG.get())shader.define("CHANNEL_G");
    else shader.removeDefine("CHANNEL_G");

    if (channelB.get()) shader.define("CHANNEL_B");
    else shader.removeDefine("CHANNEL_B");

    if (mono.get()) shader.define("MONO");
    else shader.removeDefine("MONO");

    if (alpha.get()) shader.define("ALPHA");
    else shader.removeDefine("ALPHA");
}
