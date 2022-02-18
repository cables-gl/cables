
const
    render = op.inTrigger("Render"),
    scale = op.inValue("Scale", 1),
    time = op.inValue("Time", 0),

    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);

shader.setSource(shader.getDefaultVertexShader(), attachments.curl_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    // textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1),

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

let lastTime=0;

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    uniTimeDelta.set(time.get() - lastTime);
    lastTime = time.get();

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    // if (inTexMask.get())cgl.setTexture(1, inTexMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
