const
    render = op.inTrigger("Render"),
    inArea = op.inValueSelect("Area", ["Sphere", "Box"], "Sphere"),
    inInvArea = op.inBool("Invert Area", false),
    inMethod = op.inValueSelect("Method", ["Point", "Direction", "Collision"], "Point"),
    inStrength = op.inFloat("Strength", 1),
    inMul = op.inFloat("Size", 1),
    inFalloff = op.inFloat("Falloff", 1),

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
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
op.setPortGroup("Collision", [inBounciness, inRandomDir, inForceOutwards]);
op.setPortGroup("Position", [x, y, z]);
op.toWorkPortsNeedToBeLinked(inPositions);
shader.setSource(shader.getDefaultVertexShader(), attachments.velocityarea_frag);

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

    uniformMorph = new CGL.Uniform(shader, "f", "strength", inStrength),
    uniform2 = new CGL.Uniform(shader, "f", "falloff", inFalloff),
    uniAreaPos = new CGL.Uniform(shader, "3f", "areaPos", x, y, z),
    uniScale = new CGL.Uniform(shader, "3f", "scale", scale_x, scale_y, scale_z),
    uniDir = new CGL.Uniform(shader, "3f", "direction", dir_x, dir_y, dir_z),
    uniCollisionParams = new CGL.Uniform(shader, "4f", "collisionParams", inBounciness, inRandomDir, inForceOutwards, inForceOutwards),

    uniformMul = new CGL.Uniform(shader, "f", "size", inMul);

function drawHelpers()
{
    const effect = cgl.currentTextureEffect;
    effect.endEffect();

    gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

    cgl.pushModelMatrix();

    mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);

    if (inArea.get() == "Box")
        CABLES.GL_MARKER.drawCube(op,
            inMul.get() * scale_x.get() + inFalloff.get(),
            inMul.get() * scale_y.get() + inFalloff.get(),
            inMul.get() * scale_z.get() + inFalloff.get());
    else if (inArea.get() == "Sphere")
        CABLES.GL_MARKER.drawCube(op,
            inMul.get() + inFalloff.get(),
            inMul.get() + inFalloff.get(),
            inMul.get() + inFalloff.get());

    cgl.popModelMatrix();

    effect.continueEffect();
}

function updateDefines()
{
    shader.toggleDefine("MOD_AREA_AXIS_X", inArea.get() == "Axis X");
    shader.toggleDefine("MOD_AREA_AXIS_Y", inArea.get() == "Axis Y");
    shader.toggleDefine("MOD_AREA_AXIS_Z", inArea.get() == "Axis Z");
    shader.toggleDefine("MOD_AREA_AXIS_X_INFINITE", inArea.get() == "Axis X Infinite");
    shader.toggleDefine("MOD_AREA_AXIS_Y_INFINITE", inArea.get() == "Axis Y Infinite");
    shader.toggleDefine("MOD_AREA_AXIS_Z_INFINITE", inArea.get() == "Axis Z Infinite");
    shader.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    shader.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
    shader.toggleDefine("MOD_AREA_TRIPRISM", inArea.get() == "Tri Prism");
    shader.toggleDefine("MOD_AREA_HEXPRISM", inArea.get() == "Hex Prism");

    shader.toggleDefine("METHOD_POINT", inMethod.get() == "Point");
    shader.toggleDefine("METHOD_DIR", inMethod.get() == "Direction");
    shader.toggleDefine("METHOD_COLLISION", inMethod.get() == "Collision");

    shader.toggleDefine("HAS_TEX_LIFETIME", inLifetime.isLinked());

    shader.toggleDefine("INVERT_SHAPE", inInvArea.get());

    inMul.setUiAttribs({ "greyout": inArea.get() != "Sphere" });

    shader.toggleDefine("HAS_TEX_MUL", inTexMultiply.isLinked());

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

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    if (cgl.shouldDrawHelpers(op))drawHelpers();
    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                "posX": x,
                "posY": y,
                "posZ": z,
            });

    trigger.trigger();
};
