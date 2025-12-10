const
    render = op.inTrigger("Render"),
    inArea = op.inValueSelect("Area", ["Everywhere", "Sphere", "Box"], "Everywhere"),
    inInvArea = op.inBool("Invert Area", false),
    inMethod = op.inValueSelect("Method", ["Point", "Direction", "Collision"], "Direction"),
    inStrength = op.inFloat("Strength", 1),
    inMul = op.inFloat("Size", 1),
    inFalloff = op.inFloat("Falloff", 0.3),
    inBounciness = op.inFloat("Boncyness", 1),
    inRandomDir = op.inFloat("Dir Randomness", 1),
    inForceOutwards = op.inFloat("inForceOutwards", 1),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    dir_x = op.inValue("Velocity X", 0),
    dir_y = op.inValue("Velocity Y", 1),
    dir_z = op.inValue("Velocity Z", 0),
    scale_x = op.inValue("Size X", 1),
    scale_y = op.inValue("Size Y", 1),
    scale_z = op.inValue("Size Z", 1),
    inPositions = op.inTexture("Positions"),
    inAbsVel = op.inTexture("Absolute Velocity"),
    inLifetime = op.inTexture("Lifetime"),
    inTexMultiply = op.inTexture("Multiply"),

    inTimeAge = op.inTexture("Timing Internal"),
    inTimeStart = op.inFloat("Age Start", 0.0),
    inTimeEnd = op.inFloat("Age End", 1000.0),
    inTimeFade = op.inFloat("Age Fade Duration", 0.2),
    inVisualize = op.inTrigger("Draw Visual Helper"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
op.setPortGroup("Collision", [inBounciness, inRandomDir, inForceOutwards]);
op.setPortGroup("Position", [x, y, z]);
op.setPortGroup("Age Activation", [inTimeEnd, inTimeFade, inTimeStart, inTimeAge]);
op.toWorkPortsNeedToBeLinked(inPositions);
shader.setSource(shader.getDefaultVertexShader(), attachments.velocityarea_frag);

inTimeAge.onLinkChanged =
    inLifetime.onLinkChanged =
    inAbsVel.onLinkChanged =
    inTexMultiply.onLinkChanged =
    inInvArea.onChange =
    inMethod.onChange =
    inArea.onChange = updateDefines;

updateDefines();

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    texposuni = new CGL.Uniform(shader, "t", "texPos", 1),
    texMuluni = new CGL.Uniform(shader, "t", "texMul", 2),
    texAbsVel = new CGL.Uniform(shader, "t", "texAbsVel", 3),
    texLifetime = new CGL.Uniform(shader, "t", "texLifetime", 4),
    texTiming = new CGL.Uniform(shader, "t", "texTiming", 5),

    uniformMorph = new CGL.Uniform(shader, "f", "strength", inStrength),
    uniform2 = new CGL.Uniform(shader, "f", "falloff", inFalloff),
    uniAreaPos = new CGL.Uniform(shader, "3f", "areaPos", x, y, z),
    uniScale = new CGL.Uniform(shader, "3f", "scale", scale_x, scale_y, scale_z),
    uniDir = new CGL.Uniform(shader, "3f", "direction", dir_x, dir_y, dir_z),
    uniAgeMul = new CGL.Uniform(shader, "3f", "ageMul", inTimeStart, inTimeEnd, inTimeFade),
    uniCollisionParams = new CGL.Uniform(shader, "4f", "collisionParams", inBounciness, inRandomDir, inForceOutwards, inForceOutwards),

    uniformMul = new CGL.Uniform(shader, "f", "size", inMul);

function drawHelpers()
{
    if (op.isCurrentUiOp())
        gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

    cgl.pushModelMatrix();

    mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);

    if (cgl.shouldDrawHelpers(op))
    {
        if (inArea.get() == "Box")
            CABLES.GL_MARKER.drawCube(op,
                scale_x.get() + inFalloff.get() / 2,
                scale_y.get() + inFalloff.get() / 2,
                scale_z.get() + inFalloff.get() / 2);
        else if (inArea.get() == "Sphere")
            CABLES.GL_MARKER.drawSphere(op, inMul.get() + inFalloff.get());
    }
    cgl.popModelMatrix();
}

function updateDefines()
{
    inMul.setUiAttribs({ "greyout": inArea.get() != "Sphere" });
    x.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });
    y.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });
    z.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });

    inTimeStart.setUiAttribs({ "greyout": !inTimeAge.isLinked() });
    inTimeEnd.setUiAttribs({ "greyout": !inTimeAge.isLinked() });
    inTimeFade.setUiAttribs({ "greyout": !inTimeAge.isLinked() });

    inFalloff.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });

    shader.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    shader.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
    shader.toggleDefine("MOD_AREA_EVERYWHERE", inArea.get() == "Everywhere");

    shader.toggleDefine("METHOD_POINT", inMethod.get() == "Point");
    shader.toggleDefine("METHOD_DIR", inMethod.get() == "Direction");
    shader.toggleDefine("METHOD_COLLISION", inMethod.get() == "Collision");

    shader.toggleDefine("HAS_TEX_TIMING", inTimeAge.isLinked());
    shader.toggleDefine("HAS_TEX_LIFETIME", inLifetime.isLinked());
    shader.toggleDefine("HAS_TEX_MUL", inTexMultiply.isLinked());

    shader.toggleDefine("INVERT_SHAPE", inInvArea.get());

    scale_x.setUiAttribs({ "greyout": inArea.get() != "Box" });
    scale_y.setUiAttribs({ "greyout": inArea.get() != "Box" });
    scale_z.setUiAttribs({ "greyout": inArea.get() != "Box" });

    dir_x.setUiAttribs({ "greyout": inMethod.get() != "Direction" });
    dir_y.setUiAttribs({ "greyout": inMethod.get() != "Direction" });
    dir_z.setUiAttribs({ "greyout": inMethod.get() != "Direction" });

    inBounciness.setUiAttribs({ "greyout": inMethod.get() != "Collision" });
    inRandomDir.setUiAttribs({ "greyout": inMethod.get() != "Collision" });
    inForceOutwards.setUiAttribs({ "greyout": inMethod.get() != "Collision" });

    if (!inAbsVel.isLinked() && inMethod.get() == "Collision")op.setUiError("absvelneeded", "need to connect abs velocity");
    else op.setUiError("absvelneeded", null);
}

inVisualize.onTriggered = function ()
{
    drawHelpers();
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!inPositions.get()) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    cgl.setTexture(1, inPositions.get().tex);
    if (inTexMultiply.get()) cgl.setTexture(2, inTexMultiply.get().tex);
    if (inAbsVel.get()) cgl.setTexture(3, inAbsVel.get().tex);
    if (inLifetime.get()) cgl.setTexture(4, inLifetime.get().tex);
    if (inTimeAge.get()) cgl.setTexture(5, inTimeAge.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
