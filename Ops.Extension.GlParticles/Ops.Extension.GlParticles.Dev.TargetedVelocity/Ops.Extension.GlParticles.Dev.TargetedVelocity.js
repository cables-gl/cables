const
    render = op.inTrigger("Render"),
    inInvArea = op.inBool("Invert Area", false),
    inStrength = op.inFloat("Strength", 1),
    x = op.inValue("x", 0),
    y = op.inValue("y", 0),
    z = op.inValue("z", 0),
    scalex = op.inValue("Scale x", 1),
    scaley = op.inValue("Scale y", 1),
    scalez = op.inValue("Scale z", 1),

    inDoRot = op.inBool("Rotate", false),
    rotx = op.inValue("Rotation X", 0),
    roty = op.inValue("Rotation Y", 0),
    rotz = op.inValue("Rotation Z", 0),

    inTexTargetPos = op.inTexture("Target Positions"),
    trigger = op.outTrigger("trigger"),
    outTexVel = op.outTexture("Velocity"),
    outTexCollision = op.outTexture("Collision");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
op.setPortGroup("Position", [x, y, z]);
op.setPortGroup("Scale", [scalex, scaley, scalez]);
op.setPortGroup("Rotation", [inDoRot, rotx, roty, rotz]);
shader.setSource(shader.getDefaultVertexShader(), attachments.copy_frag);

inDoRot.onChange = updateDefines;

let
    shaderCopyTex = new CGL.Uniform(shader, "t", "tex", 0),
    shaderCopyTex2 = new CGL.Uniform(shader, "t", "texVel", 1),
    textureUniform,
    texposuni, texAbsVel, texTiming,
    uniformMorph, uniAreaPos, uniTimeDiff, uniScale, uniRot,
    texCollisionFeedback,
    texTargetPosuni, texLifeProgress, tcCollision;

let needsUpdateDefine = false;
let velAreaSys = null;

updateDefines();

/// /////////////////

function createShader()
{
    if (velAreaSys)velAreaSys.dispose();
    velAreaSys = new CGL.CopyTexture(op.patch.cgl, "velocityArea_frag",
        {
            "shader": attachments.velocityarea_frag,
            "vertexShader": CGL.Shader.getDefaultVertexShader(),
            "numRenderBuffers": 4,
            "pixelFormat": cgl.frameStore.particleSys.pixelFormat,
            "filter": CGL.Texture.FILTER_NEAREST
        });

    textureUniform = new CGL.Uniform(velAreaSys.bgShader, "t", "tex", 0),
    texposuni = new CGL.Uniform(velAreaSys.bgShader, "t", "texPos", 1),
    texAbsVel = new CGL.Uniform(velAreaSys.bgShader, "t", "texAbsVel", 3),
    texTiming = new CGL.Uniform(velAreaSys.bgShader, "t", "texTiming", 5),
    texCollisionFeedback = new CGL.Uniform(velAreaSys.bgShader, "t", "texCollision", 6),
    texTargetPosuni = new CGL.Uniform(velAreaSys.bgShader, "t", "texTargetPos", 7),

    uniTimeDiff = new CGL.Uniform(velAreaSys.bgShader, "f", "timeDiff", 0),

    uniformMorph = new CGL.Uniform(velAreaSys.bgShader, "f", "strength", inStrength),
    uniAreaPos = new CGL.Uniform(velAreaSys.bgShader, "3f", "areaPos", x, y, z),
    uniScale = new CGL.Uniform(velAreaSys.bgShader, "3f", "scale", scalex, scaley, scalez),
    uniRot = new CGL.Uniform(velAreaSys.bgShader, "3f", "rot", rotx, roty, rotz);

    updateDefines();
}

function updateDefines()
{
    if (!velAreaSys || !velAreaSys.bgShader)
    {
        needsUpdateDefine = true;
        return;
    }
    velAreaSys.bgShader.toggleDefine("DO_ROT", inDoRot.get());

    rotx.setUiAttribs({ "greyout": !inDoRot.get() });
    roty.setUiAttribs({ "greyout": !inDoRot.get() });
    rotz.setUiAttribs({ "greyout": !inDoRot.get() });

    needsUpdateDefine = false;
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!cgl.frameStore.particleSys) return;
    if (!velAreaSys) createShader();

    if (needsUpdateDefine)updateDefines();

    // custom shader -------------------------------------------

    if (CABLES.UI)
    {
        cgl.currentTextureEffect.endEffect();

        if (CABLES.UI) gui.setTransform(op.id, x.get(), y.get(), z.get());

        if (op.isCurrentUiOp())
        {
            cgl.pushModelMatrix();

            gui.setTransformGizmo(
                {
                    "posX": x,
                    "posY": y,
                    "posZ": z,
                });

            cgl.popModelMatrix();
        }

        cgl.currentTextureEffect.continueEffect();
    }

    velAreaSys.bgShader.popTextures();

    if (!tcCollision)
    {
        tcCollision = new CGL.CopyTexture(op.patch.cgl, "ps_feedback", { "pixelFormat": cgl.frameStore.particleSys.pixelFormat, "filter": CGL.Texture.FILTER_NEAREST });
        outTexCollision.setRef(CGL.Texture.getEmptyTexture(cgl));
    }
    if (cgl.frameStore.particleSys.reset) outTexCollision.setRef(CGL.Texture.getEmptyTexture(cgl));

    uniTimeDiff.set(cgl.frameStore.particleSys.timeDiff);

    velAreaSys.bgShader.pushTexture(texCollisionFeedback, tcCollision.copy(outTexCollision.get()));
    velAreaSys.bgShader.pushTexture(textureUniform, cgl.currentTextureEffect.getCurrentSourceTexture());
    velAreaSys.bgShader.pushTexture(texposuni, cgl.frameStore.particleSys.texPos || CGL.Texture.getEmptyTexture(cgl));
    velAreaSys.bgShader.pushTexture(texAbsVel, cgl.frameStore.particleSys.texAbsVel || CGL.Texture.getEmptyTexture(cgl));
    velAreaSys.bgShader.pushTexture(texLifeProgress, cgl.frameStore.particleSys.texLifeProgress || CGL.Texture.getEmptyTexture(cgl));
    velAreaSys.bgShader.pushTexture(texTiming, cgl.frameStore.particleSys.texTimingInt || CGL.Texture.getEmptyTexture(cgl));
    velAreaSys.bgShader.pushTexture(texTargetPosuni, inTexTargetPos.get() || CGL.Texture.getEmptyTexture(cgl));

    velAreaSys.copy(cgl.frameStore.particleSys.texPos);

    outTexVel.setRef(velAreaSys.fb.getTextureColorNum(0));
    outTexCollision.setRef(velAreaSys.fb.getTextureColorNum(1));

    // imagecompose... -------------------------------------------

    if (velAreaSys && velAreaSys.fb)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();
        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
        cgl.setTexture(1, velAreaSys.fb.getTextureColorNum(0).tex);

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};
