const
    render = op.inTrigger("Render"),
    scale = op.inFloat("Scale", 1),
    time = op.inFloat("Time", 0),
    posX = op.inFloat("Pos X", 0),
    posY = op.inFloat("Pos Y", 0),
    posZ = op.inFloat("Pos Z", 0),

    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.curl_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    // textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1),

    uniSeed = new CGL.Uniform(shader, "3f", "offset", posX, posX, posX),
    uniTime = new CGL.Uniform(shader, "f", "time", time),
    uniScale = new CGL.Uniform(shader, "f", "scale", scale),
    uniTimeDelta = new CGL.Uniform(shader, "f", "timeDelta", 1);

time.onChange =
    scale.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("MOD_NORM_SPEED", true);
}

let lastTime = 0;

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    uniTimeDelta.set(time.get() - lastTime);
    lastTime = time.get();

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
