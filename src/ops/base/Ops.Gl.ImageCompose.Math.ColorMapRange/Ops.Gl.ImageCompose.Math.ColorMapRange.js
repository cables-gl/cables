const
    render = op.inTrigger("render"),
    min1 = op.inValueSlider("Old Min", 0),
    max1 = op.inValueSlider("Old Max", 1),
    min2 = op.inValueSlider("New Min", 0),
    max2 = op.inValueSlider("New Max", 1),

    inClamp = op.inBool("Clamp", true),

    inR = op.inBool("R", true),
    inG = op.inBool("G", true),
    inB = op.inBool("B", true),
    inA = op.inBool("A", false),

    trigger = op.outTrigger("trigger");

op.setPortGroup("Input Range", [min1, max1]);
op.setPortGroup("Output Range", [min2, max2, inClamp]);

const cgl = op.patch.cgl;

const shader = new CGL.Shader(cgl, "colorMaprange");
shader.setSource(shader.getDefaultVertexShader(), attachments.maprange_frag);
toggleChannels(shader);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniMin1 = new CGL.Uniform(shader, "f", "min1", min1),
    uniMin2 = new CGL.Uniform(shader, "f", "min2", min2),
    unimax1 = new CGL.Uniform(shader, "f", "max1", max1),
    unimax2 = new CGL.Uniform(shader, "f", "max2", max2);

inR.onChange =
    inG.onChange =
    inB.onChange =
    inA.onChange =
    inClamp.onChange = () =>
    {
        toggleChannels(shader);
    };

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!cgl.currentTextureEffect.getCurrentSourceTexture()) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

function toggleChannels(shader)
{
    shader.toggleDefine("CH_R", inR.get());
    shader.toggleDefine("CH_G", inG.get());
    shader.toggleDefine("CH_B", inB.get());
    shader.toggleDefine("CH_A", inA.get());
    shader.toggleDefine("CLAMP", inClamp.get());
}
