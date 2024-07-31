const
    render = op.inTrigger("Render"),
    inArea = op.inValueSelect("Area", ["Everywhere", "Sphere", "Box"], "Everywhere"),
    inMethod = op.inValueSelect("Method", ["Point", "Direction", "Collision","Rotate"], "Point"),
    inInvArea = op.inBool("Invert Area", false),
    inStrength = op.inFloat("Strength", 1),
    inSize = op.inFloat("Size", 1),
    inFalloff = op.inFloat("Falloff", 0.3),
    inBounciness = op.inFloat("Boncyness", 0.5),
    inCollisionFade = op.inFloat("Collision fade", 1),
    inRandomDir = op.inFloat("Dir Randomness", 0.5),
    inForceOutwards = op.inFloat("inForceOutwards", 0.5),
    x = op.inValue("x", 0),
    y = op.inValue("y", 0),
    z = op.inValue("z", 0),
    dir_x = op.inValue("Velocity Dir X", 0),
    dir_y = op.inValue("Velocity Dir Y", 1),
    dir_z = op.inValue("Velocity Dir Z", 0),
    scale_x = op.inValue("Size X", 1),
    scale_y = op.inValue("Size Y", 1),
    scale_z = op.inValue("Size Z", 1),
    inTexMultiply = op.inTexture("Multiply"),
    inTimeStart = op.inFloat("Age Start", 0.0),
    inTimeEnd = op.inFloat("Age End", 1000.0),
    inTimeFade = op.inFloat("Age Fade", 1),
    trigger = op.outTrigger("trigger"),
    outTexVel = op.outTexture("Velocity"),
    outTexCollision = op.outTexture("Collision");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
op.setPortGroup("Collision", [inBounciness, inRandomDir, inForceOutwards,inCollisionFade]);
op.setPortGroup("Position", [x, y, z]);
op.setPortGroup("Age Activation", [inTimeEnd, inTimeFade, inTimeStart]);
shader.setSource(shader.getDefaultVertexShader(), attachments.copy_frag);

inTexMultiply.onLinkChanged =
    inInvArea.onChange =
    inMethod.onChange =
    inArea.onChange = updateDefines;

let
    shaderCopyTex = new CGL.Uniform(shader, "t", "tex", 0),
    shaderCopyTex2 = new CGL.Uniform(shader, "t", "texVel", 1),
    textureUniform,
    texposuni, texMuluni, texAbsVel, texLifeProgress, texTiming,
    uniformMorph, uniform2,
    uniAreaPos, uniTimeDiff, uniScale, uniDir,
    uniAgeMul, uniCollisionParams, uniformMul, texCollisionFeedback,
    tcCollision;

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
    texMuluni = new CGL.Uniform(velAreaSys.bgShader, "t", "texMul", 2),
    texAbsVel = new CGL.Uniform(velAreaSys.bgShader, "t", "texAbsVel", 3),
    texLifeProgress = new CGL.Uniform(velAreaSys.bgShader, "t", "texLifeProgress", 4),
    texTiming = new CGL.Uniform(velAreaSys.bgShader, "t", "texTiming", 5),
    texCollisionFeedback = new CGL.Uniform(velAreaSys.bgShader, "t", "texCollision", 6),

    uniTimeDiff = new CGL.Uniform(velAreaSys.bgShader, "f", "timeDiff", 0),
    new CGL.Uniform(velAreaSys.bgShader, "f", "collisionFade", inCollisionFade),

    uniformMorph = new CGL.Uniform(velAreaSys.bgShader, "f", "strength", inStrength),
    uniform2 = new CGL.Uniform(velAreaSys.bgShader, "f", "falloff", inFalloff),
    uniAreaPos = new CGL.Uniform(velAreaSys.bgShader, "3f", "areaPos", x, y, z),
    uniScale = new CGL.Uniform(velAreaSys.bgShader, "3f", "scale", scale_x, scale_y, scale_z),
    uniDir = new CGL.Uniform(velAreaSys.bgShader, "3f", "direction", dir_x, dir_y, dir_z),
    uniAgeMul = new CGL.Uniform(velAreaSys.bgShader, "3f", "ageMul", inTimeStart, inTimeEnd, inTimeFade),
    uniCollisionParams = new CGL.Uniform(velAreaSys.bgShader, "4f", "collisionParams", inBounciness, inRandomDir, inForceOutwards, inForceOutwards),

    uniformMul = new CGL.Uniform(velAreaSys.bgShader, "f", "size", inSize);

    updateDefines();
}

function updateDefines()
{
    inSize.setUiAttribs({ "greyout": inArea.get() != "Sphere" });
    x.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });
    y.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });
    z.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });

    // inTimeStart.setUiAttribs({"greyout":!inTimeAge.isLinked()});
    // inTimeEnd.setUiAttribs({"greyout":!inTimeAge.isLinked()});
    // inTimeFade.setUiAttribs({"greyout":!inTimeAge.isLinked()});
    inFalloff.setUiAttribs({ "greyout": inArea.get() == "Everywhere" });

    if (velAreaSys)
    {
        velAreaSys.bgShader.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
        velAreaSys.bgShader.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
        velAreaSys.bgShader.toggleDefine("MOD_AREA_EVERYWHERE", inArea.get() == "Everywhere");

        velAreaSys.bgShader.toggleDefine("METHOD_POINT", inMethod.get() == "Point");
        velAreaSys.bgShader.toggleDefine("METHOD_DIR", inMethod.get() == "Direction");
        velAreaSys.bgShader.toggleDefine("METHOD_COLLISION", inMethod.get() == "Collision");
        velAreaSys.bgShader.toggleDefine("METHOD_ROTATE", inMethod.get() == "Rotate");


        // velAreaSys.bgShader.toggleDefine("HAS_TEX_TIMING", inTimeAge.isLinked());
        // velAreaSys.bgShader.toggleDefine("HAS_TEX_LIFETIME", inLifetime.isLinked());
        velAreaSys.bgShader.toggleDefine("HAS_TEX_MUL", inTexMultiply.isLinked());

        velAreaSys.bgShader.toggleDefine("INVERT_SHAPE", inInvArea.get());
    }

    scale_x.setUiAttribs({ "greyout": inArea.get() != "Box" });
    scale_y.setUiAttribs({ "greyout": inArea.get() != "Box" });
    scale_z.setUiAttribs({ "greyout": inArea.get() != "Box" });

    dir_x.setUiAttribs({ "greyout": inMethod.get() != "Direction" &&inMethod.get() != "Rotate"  });
    dir_y.setUiAttribs({ "greyout": inMethod.get() != "Direction" &&inMethod.get() != "Rotate"  });
    dir_z.setUiAttribs({ "greyout": inMethod.get() != "Direction" &&inMethod.get() != "Rotate"  });

    inBounciness.setUiAttribs({ "greyout": inMethod.get() != "Collision" });
    inRandomDir.setUiAttribs({ "greyout": inMethod.get() != "Collision" });
    inForceOutwards.setUiAttribs({ "greyout": inMethod.get() != "Collision" });
}

// function drawHelpers()
// {
//     if (op.isCurrentUiOp()) gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

//     cgl.pushModelMatrix();

//     mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);

//     if (cgl.shouldDrawHelpers(op))
//     {
//         if (inArea.get() == "Box")
//             CABLES.GL_MARKER.drawCube(op,
//                     scale_x.get() + inFalloff.get()/2,
//                     scale_y.get() + inFalloff.get()/2,
//                     scale_z.get() + inFalloff.get()/2);
//             else if (inArea.get() == "Sphere")
//                 CABLES.GL_MARKER.drawSphere(op, inSize.get()+inFalloff.get());

//     }
//     cgl.popModelMatrix();

// }

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!cgl.frameStore.particleSys) return;
    if (!velAreaSys) createShader();

    // custom shader -------------------------------------------

    if (CABLES.UI)
    {
        cgl.currentTextureEffect.endEffect();

        if (CABLES.UI) gui.setTransform(op.id, x.get(), y.get(), z.get());

        if (CABLES.GL_MARKER)
        {
            cgl.pushModelMatrix();
            mat4.identity(cgl.mMatrix);

            mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);

            if (inArea.get() == "Box")
            {
                CABLES.GL_MARKER.drawCube(op,
                    scale_x.get() * 2,
                    scale_y.get() * 2,
                    scale_z.get() * 2);
                CABLES.GL_MARKER.drawCube(op,
                    scale_x.get() * 2 + inFalloff.get() * 2.0,
                    scale_y.get() * 2 + inFalloff.get() * 2.0,
                    scale_z.get() * 2 + inFalloff.get() * 2.0);
            }
            else if (inArea.get() == "Sphere")
            {
                CABLES.GL_MARKER.drawCircle(op, inSize.get() /2.0);
                CABLES.GL_MARKER.drawCircle(op, inSize.get() /2.0 + inFalloff.get());
            }

            cgl.popModelMatrix();
        }
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
    velAreaSys.bgShader.pushTexture(texposuni, cgl.frameStore.particleSys.texPos);
    velAreaSys.bgShader.pushTexture(texMuluni, inTexMultiply.get());
    velAreaSys.bgShader.pushTexture(texAbsVel, cgl.frameStore.particleSys.texAbsVel);
    velAreaSys.bgShader.pushTexture(texLifeProgress, cgl.frameStore.particleSys.texLifeProgress);
    velAreaSys.bgShader.pushTexture(texTiming, cgl.frameStore.particleSys.texTimingInt);

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
