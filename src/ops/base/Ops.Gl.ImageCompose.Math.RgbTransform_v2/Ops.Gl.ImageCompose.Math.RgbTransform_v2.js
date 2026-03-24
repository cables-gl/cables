const
    render = op.inTrigger("Render"),

    inDoTrans = op.inBool("Translate", true),
    posx = op.inValue("Pos X", 0),
    posy = op.inValue("Pos Y", 0),
    posz = op.inValue("Pos Z", 0),

    inDoScale = op.inBool("Scale", true),
    scalex = op.inValue("Scale X", 1),
    scaley = op.inValue("Scale Y", 1),
    scalez = op.inValue("Scale Z", 1),

    inDoRot = op.inBool("Rotate", true),
    rotx = op.inValue("Rotation X", 1),
    roty = op.inValue("Rotation Y", 1),
    rotz = op.inValue("Rotation Z", 1),

    inTexMask = op.inTexture("Mask"),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Rotation", [inDoRot, rotx, roty, rotz]);
op.setPortGroup("Position", [inDoTrans, posx, posy, posz]);
op.setPortGroup("Scale", [inDoScale, scalex, scaley, scalez]);
op.setUiAxisPorts(posx, posz, posy);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbmul_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1),
    uniformTransl = new CGL.Uniform(shader, "3f", "translate", posx, posy, posz),
    uniformScale = new CGL.Uniform(shader, "3f", "scale", scalex, scaley, scalez),
    uniformRot = new CGL.Uniform(shader, "3f", "rot", rotx, roty, rotz);

inTexMask.onChange =
    inDoTrans.onChange =
    inDoRot.onChange =
    inDoScale.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("MOD_MASK", inTexMask.get());

    shader.toggleDefine("DO_TRANS", inDoTrans.get());
    shader.toggleDefine("DO_ROT", inDoRot.get());
    shader.toggleDefine("DO_SCALE", inDoScale.get());

    posx.setUiAttribs({ "greyout": !inDoTrans.get() });
    posy.setUiAttribs({ "greyout": !inDoTrans.get() });
    posz.setUiAttribs({ "greyout": !inDoTrans.get() });

    rotx.setUiAttribs({ "greyout": !inDoRot.get() });
    roty.setUiAttribs({ "greyout": !inDoRot.get() });
    rotz.setUiAttribs({ "greyout": !inDoRot.get() });

    scalex.setUiAttribs({ "greyout": !inDoScale.get() });
    scaley.setUiAttribs({ "greyout": !inDoScale.get() });
    scalez.setUiAttribs({ "greyout": !inDoScale.get() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexMask.get())cgl.setTexture(1, inTexMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
