const
    render = op.inTrigger("Render"),
    inArea = op.inValueSelect("Area", ["Everywhere", "Sphere", "Box"], "Sphere"),
    inInvertArea = op.inBool("Invert Area", false),

    noiseStr = op.inFloat("Strength", 1),
    noiseScale = op.inFloat("Scale", 10),

    inSize = op.inFloat("Size", 11),
    inFalloff = op.inFloat("Falloff", 1),
    x = op.inValue("x", 0),
    y = op.inValue("y", 0),
    z = op.inValue("z", 0),

    noisex = op.inValue("Noise X"),
    noisey = op.inValue("Noise Y"),
    noisez = op.inValue("Noise Z"),

    mul_x = op.inValue("Multiply X", 1),
    mul_y = op.inValue("Multiply Y", 1),
    mul_z = op.inValue("Multiply Z", 1),

    scale_x = op.inValue("Size X", 1),
    scale_y = op.inValue("Size Y", 1),
    scale_z = op.inValue("Size Z", 1),

    // inPositions = op.inTexture("Positions"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
op.setPortGroup("Position", [x, y, z]);
op.setPortGroup("Size", [scale_x, scale_y, scale_z]);
// op.toWorkPortsNeedToBeLinked(inPositions);
shader.setSource(shader.getDefaultVertexShader(), attachments.perlin_frag + attachments.noisefield_frag);

inInvertArea.onChange =
    inArea.onChange = updateDefines;
updateDefines();

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    texposuni = new CGL.Uniform(shader, "t", "texPos", 1),
    uniform2 = new CGL.Uniform(shader, "f", "falloff", inFalloff),
    uniAreaPos = new CGL.Uniform(shader, "3f", "areaPos", x, y, z),
    uniNoisePos = new CGL.Uniform(shader, "3f", "noisePos", noisex, noisey, noisez),
    uniNoiseMul = new CGL.Uniform(shader, "3f", "noiseMul", mul_x, mul_y, mul_z),

    uniScale = new CGL.Uniform(shader, "3f", "scale", scale_x, scale_y, scale_z),
    uniNoise = new CGL.Uniform(shader, "4f", "noise", noiseStr, noiseScale, noiseScale, noiseScale),

    uniformMul = new CGL.Uniform(shader, "f", "size", inSize);

function drawHelpers()
{
    // const effect = cgl.currentTextureEffect;
    // effect.endEffect();

    // gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

    // cgl.pushModelMatrix();

    // mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);

    // if (inArea.get() == "Box")
    //     CABLES.GL_MARKER.drawCube(op,
    //         inSize.get() * scale_x.get() + inFalloff.get(),
    //         inSize.get() * scale_y.get() + inFalloff.get(),
    //         inSize.get() * scale_z.get() + inFalloff.get());
    // else if (inArea.get() == "Sphere")
    //     CABLES.GL_MARKER.drawCube(op,
    //         inSize.get() + inFalloff.get(),
    //         inSize.get() + inFalloff.get(),
    //         inSize.get() + inFalloff.get());

    // cgl.popModelMatrix();

    // effect.continueEffect();
}

function updateDefines()
{
    shader.toggleDefine("MOD_AREA_AXIS_X", inArea.get() == "Axis X");
    shader.toggleDefine("MOD_AREA_AXIS_Y", inArea.get() == "Axis Y");
    shader.toggleDefine("MOD_AREA_AXIS_Z", inArea.get() == "Axis Z");
    shader.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    shader.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
    shader.toggleDefine("MOD_AREA_EVERYWHERE", inArea.get() == "Everywhere");
    shader.toggleDefine("MOD_AREA_TRIPRISM", inArea.get() == "Tri Prism");
    shader.toggleDefine("MOD_AREA_HEXPRISM", inArea.get() == "Hex Prism");

    shader.toggleDefine("INVERT", inInvertArea.get());

    scale_x.setUiAttribs({ "greyout": inArea.get() != "Box" });
    scale_y.setUiAttribs({ "greyout": inArea.get() != "Box" });
    scale_z.setUiAttribs({ "greyout": inArea.get() != "Box" });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    // if (!inPositions.get()) return;
    if (!cglframeStoreparticleSys) return;

    if (CABLES.UI)
    {
        cgl.currentTextureEffect.endEffect();

        if (CABLES.GL_MARKER)
        {
            cgl.pushModelMatrix();
            mat4.identity(cgl.mMatrix);

            if (CABLES.UI) gui.setTransform(op.id, x.get(), y.get(), z.get());

            mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);

            CABLES.GL_MARKER.drawCube(op,
                inSize.get(),
                inSize.get(),
                inSize.get());

            cgl.popModelMatrix();
        }

        if (op.isCurrentUiOp())
        {
            cgl.pushModelMatrix();
            // mat4.identity(cgl.mMatrix);

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

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    cgl.setTexture(1, cglframeStoreparticleSys.texPos.tex);

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
