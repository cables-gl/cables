const
    emptyTex = CGL.Texture.getEmptyTexture(op.patch.cgl),
    exec = op.inTrigger("Execute"),
    inPlay = op.inBool("Play", true),
    inReset = op.inTriggerButton("Reset"),
    inParticleLife = op.inSwitch("Lifetime", ["spawn+die", "static"], "spawn+die"),
    inNumParticles = op.inInt("Num Particles", 10000),
    inSpeed = op.inFloat("Speed", 1),
    inSpawnRate = op.inFloatSlider("Spawn Rate", 1),
    inRandSpawn = op.inBool("Randomize Spawn", true),


    inLifeTimeMin = op.inFloat("Min Lifetime", 0.5),
    inLifeTimeMax = op.inFloat("Max Lifetime", 2),
    inResetRandLifetime = op.inBool("Reset Randomize Age", true),

    inTexLifeTime = op.inTexture("Particles Lifetime"),

    inMass = op.inFloat("Mass Min", 0),
    inMassMax = op.inFloat("Mass Max", 0),
    inTexMass = op.inTexture("Particles Mass"),

    moveX = op.inFloat("Velocity X", 0),
    moveY = op.inFloat("Velocity Y", 1),
    moveZ = op.inFloat("Velocity Z", 0),

    gravX = op.inFloat("Gravity X", 0),
    gravY = op.inFloat("Gravity Y", 0),
    gravZ = op.inFloat("Gravity Z", 0),

    posX = op.inFloat("Position X", 0),
    posY = op.inFloat("Position Y", 0),
    posZ = op.inFloat("Position Z", 0),

    inTexSpawn = op.inTexture("Spawn Positions"),

    inSpawnEnergy = op.inFloat("Spawn Energy", 3),
    inTexSpawnDir = op.inTexture("Spawn Directions"),

    // inTexVelocity = op.inTexture("Velocity"),

    inVelocityDrag = op.inFloatSlider("Velocity Drag", 1),

    // inherVel = op.inFloatSlider("Inherit Velocity", 0),
    inTexPassThrough1 = op.inTexture("Pass Through 1"),
    inTexPassThrough2 = op.inTexture("Pass Through 2"),

    inPreWarmSeconds = op.inFloat("Pre Warm Seconds", 0),
    inPreWarm = op.inTriggerButton("Reset+Prewarm"),
    inRespawn = op.inBool("Respawn", true),
    inPrecision = op.inSwitch("Precision", ["32 Bit", "16 Bit"], "32 Bit"),

    // -----

    next = op.outTrigger("Next"),
    outTexPos = op.outTexture("Positions", emptyTex),
    outTexTiming = op.outTexture("Timing", emptyTex),
    outTexTimingInt = op.outTexture("Timing Internal", emptyTex),

    outVelocity = op.outTexture("Feedback Velocity Out", emptyTex),

    outAbsVelocity = op.outTexture("Absolute Velocity", emptyTex),

    outMisc = op.outTexture("Misc", emptyTex),

    outPassThrough1 = op.outTexture("Result Pass Through 1", emptyTex),
    outPassThrough2 = op.outTexture("Result Pass Through 2", emptyTex),
    outTexSize = op.outNumber("Tex Size"),
    outTime = op.outNumber("Time", 0);

op.setPortGroup("Particle Properties", [inLifeTimeMax, inLifeTimeMin, inMassMax, inMass, inTexMass, inTexLifeTime, inResetRandLifetime]);
op.setPortGroup("Constant Velocity", [moveX, moveY, moveZ]);
op.setPortGroup("Gravity", [gravX, gravY, gravZ]);

const
    cgl = op.patch.cgl;

let
    hasError = false,
    timer = new CABLES.Timer(),
    lastTime = CABLES.now(),
    texTiming = null,
    texPos = null,
    firstTime = true,
    tcTiming = null,
    tcFbMisc = null,
    tcFeedback = null,
    tcFeedbackVel = null,
    texVelocity = null,
    prewarm = false,
    texSize = 8,
    thePixelFormat = CGL.Texture.PFORMATSTR_RGBA16F,
    ps = null,
    patchLoaded = false,
    uniTexOldPos = null,
    uniTexSpawn = null,
    uniTexTiming = null,
    uniTexFeedbackVel = null,
    unitexFeedbackMisc = null,
    uniTexVel = null,
    uniPass1 = null,
    uniPass2 = null,
    uniTexLifetime = null,
    uniTexMass = null,
    uniTexSpawnDir = null,
    uniTimeParams = null,
    uniModelMatrix = null,
    uniLifeTime = null,
    uniMass = null,
    uniVel = null,
    unigrav = null,
    uniPos = null,
    uniReset = null,
    shaderDrag = null, univelDrag;

inReset.onTriggered = () =>
{
    uniReset.setValue(1);
};

inNumParticles.onChange = createTextures;

inRespawn.onChange =
    inParticleLife.onChange =
    inTexLifeTime.onLinkChanged =
    inTexMass.onLinkChanged =
    inTexSpawnDir.onLinkChanged =
    inRandSpawn.onChange =
    inResetRandLifetime.onChange = updateDefines;

inMass.onChange =
    inMassMax.onChange =
    gravX.onChange =
    gravZ.onChange =
    gravY.onChange = updateUi;

inPreWarm.onTriggered = () =>
{
    prewarm = true;
    firstTime = true;
};

const texBlack = new CGL.Texture(cgl,
    {
        "pixelFormat": CGL.Texture.PFORMATSTR_RGBA16F,
        "width": 8,
        "height": 8
    });

let velocityFeedback = null;
let velocityFeedback2 = null;
let texVelFeedA;
let texVelFeedB;

timer.play();
createShader();
updateDefines();

inPrecision.onChange = () =>
{
    createShader();
    createTextures();
    tcTiming = tcFbMisc = tcFeedback = tcFeedbackVel = null;
};

function getPixelFormat()
{
    if (inPrecision.get() == "16 Bit")thePixelFormat = CGL.Texture.PFORMATSTR_RGBA16F;
    else thePixelFormat = CGL.Texture.PFORMATSTR_RGBA32F;
    return thePixelFormat;
}

function createShader()
{
    if (ps)ps.dispose();
    ps = new CGL.CopyTexture(op.patch.cgl, "particlesys_pos", {
        "shader": attachments.particle_frag,
        "vertexShader": attachments.particle_vert,
        "numRenderBuffers": 8,
        "pixelFormat": getPixelFormat(),
        "filter": CGL.Texture.FILTER_NEAREST
    });

    firstTime = true;

    let texSlot = 0;
    uniTexOldPos = new CGL.Uniform(ps.bgShader, "t", "texOldPos", texSlot++),
    uniTexSpawn = new CGL.Uniform(ps.bgShader, "t", "texSpawnPos", texSlot++),
    uniTexTiming = new CGL.Uniform(ps.bgShader, "t", "texTiming", texSlot++),
    uniTexFeedbackVel = new CGL.Uniform(ps.bgShader, "t", "texFeedbackVel", texSlot++),
    unitexFeedbackMisc = new CGL.Uniform(ps.bgShader, "t", "texFeedbackMisc", texSlot++),
    uniTexVel = new CGL.Uniform(ps.bgShader, "t", "texVelocity", texSlot++),
    uniPass1 = new CGL.Uniform(ps.bgShader, "t", "texPassThrough1", texSlot++),
    uniPass2 = new CGL.Uniform(ps.bgShader, "t", "texPassThrough2", texSlot++),
    uniTexLifetime = new CGL.Uniform(ps.bgShader, "t", "texLifeTime", texSlot++),
    uniTexMass = new CGL.Uniform(ps.bgShader, "t", "texMass", texSlot++),
    uniTexSpawnDir = new CGL.Uniform(ps.bgShader, "t", "texSpawnDir", texSlot++),

    uniTimeParams = new CGL.Uniform(ps.bgShader, "4f", "paramsTime", 0, 0, 0, 0),
    uniModelMatrix = new CGL.Uniform(ps.bgShader, "m4", "outModelMatrix", []),
    uniLifeTime = new CGL.Uniform(ps.bgShader, "2f", "lifeTime", inLifeTimeMin, inLifeTimeMax),
    uniMass = new CGL.Uniform(ps.bgShader, "2f", "mass", inMass, inMassMax),
    uniVel = new CGL.Uniform(ps.bgShader, "4f", "velocity", moveX, moveY, moveZ, moveZ),
    unigrav = new CGL.Uniform(ps.bgShader, "3f", "gravity", gravX, gravY, gravZ),
    uniPos = new CGL.Uniform(ps.bgShader, "3f", "position", posX, posY, posZ),
    uniReset = new CGL.Uniform(ps.bgShader, "f", "reset", 1);
    updateDefines();
}

function updateUi()
{
    if (!CABLES.UI) return;

    inSpawnEnergy.setUiAttribs({ "greyout": !inTexSpawnDir.isLinked() });
    inLifeTimeMin.setUiAttribs({ "greyout": inTexLifeTime.isLinked() || inParticleLife.get() == "static" });
    inLifeTimeMax.setUiAttribs({ "greyout": inTexLifeTime.isLinked() || inParticleLife.get() == "static" });

    inMass.setUiAttribs({ "greyout": inTexMass.isLinked() });
    inMassMax.setUiAttribs({ "greyout": inTexMass.isLinked() });

    if ((inMassMax.get() == 0 && inMass.get() == 0) && (gravX.get() != 0.0 || gravY.get() != 0.0 || gravZ.get() != 0.0))
        op.setUiError("maxxGravity", "particles should have a mass when setting gravity");
    else op.setUiError("maxxGravity", null);
}

function updateDefines()
{
    ps.bgShader.toggleDefine("NORANDOMIZESPAWN", !inRandSpawn.get());
    ps.bgShader.toggleDefine("HAS_TEX_LIFETIME", inTexLifeTime.isLinked());
    ps.bgShader.toggleDefine("HAS_TEX_MASS", inTexMass.isLinked());
    ps.bgShader.toggleDefine("HAS_TEX_SPAWNDIR", inTexSpawnDir.isLinked());

    ps.bgShader.toggleDefine("RESPAWN", inRespawn.get());
    ps.bgShader.toggleDefine("RESET_RAND_LIFETIME", inResetRandLifetime.get());

    ps.bgShader.toggleDefine("STATICLIFE", inParticleLife.get() == "static");
    firstTime = true;

    updateUi();
}

function createTextures()
{
    texSize = Math.ceil(Math.sqrt(inNumParticles.get()));
    outTexSize.set(texSize);

    if (texTiming)texTiming.delete();
    if (texPos)texPos.delete();

    texTiming = new CGL.Texture(cgl, {
        "pixelFormat": getPixelFormat(),
        "filter": CGL.Texture.FILTER_NEAREST,
        "width": texSize,
        "height": texSize });

    texPos = new CGL.Texture(cgl, {
        "pixelFormat": getPixelFormat(),
        "filter": CGL.Texture.FILTER_NEAREST,
        "width": texSize,
        "height": texSize });
}

inPlay.onChange = () =>
{
    if (inPlay.get()) timer.play();
    else timer.pause();
};

function updateFrameStore()
{
    // outPassThrough1.setRef(ps.fb.getTextureColorNum(4));
    // outPassThrough2.setRef(ps.fb.getTextureColorNum(7));

    cglframeStoreparticleSys.pixelFormat = thePixelFormat;

    cglframeStoreparticleSys.texPos = ps.fb.getTextureColorNum(0);
    cglframeStoreparticleSys.texTimingInt = ps.fb.getTextureColorNum(1);
    cglframeStoreparticleSys.texLifeProgress = ps.fb.getTextureColorNum(2);
    cglframeStoreparticleSys.texVelocity = ps.fb.getTextureColorNum(3);
    cglframeStoreparticleSys.texAbsVelocity = ps.fb.getTextureColorNum(5);
}

exec.onTriggered = () =>
{
    uniModelMatrix.setValue(cgl.mMatrix);

    if (CABLES.GL_MARKER) CABLES.GL_MARKER.drawCircle(op, 0.1);

    if (cgl.currentTextureEffect || op.patch.cgl._glFrameBufferStack.length > 0)
    {
        hasError = true;
        op.setUiError("fbProblem", "Particlesystem should not be below a framebuffer (RenderToTexture, ImageCompose, etc.) op ");
    }
    else if (hasError)
    {
        op.setUiError("fbProblem", null);
    }

    cglframeStoreparticleSys = {};

    if (firstTime)
    {
        createTextures();
        uniReset.setValue(1);
    }

    if (!texTiming) createTextures();

    timer.update();

    cglframeStoreparticleSys.firstTime = firstTime;

    const timeDiff = (timer.get() - lastTime) * inSpeed.get();

    // if (CABLES.UI)
    // {
    //     if (texVelocity && (
    //         texVelocity.width != outTexSize.get() ||
    //         texVelocity.height != outTexSize.get() ||
    //         texVelocity.textureType != outTexPos.get().textureType))  op.setUiError("wrongtexsize", "inTexVelocity has wrong size or format!", 0);
    //     else op.setUiError("wrongtexsize", null);
    // }

    renderFrame(timer.get(), timeDiff);
    updateFrameStore();
    renderVelocity();

    if (firstTime)
    {
        firstTime = false;
        if (inPreWarmSeconds.get() > 0) preWarm();
    }

    uniReset.setValue(0);

    lastTime = timer.get();
};

function preWarm()
{
    console.log("prewarm");
    uniReset.setValue(1);
    renderFrame(0, 0.01);
    uniReset.setValue(0);
    renderFrame(0, 0.01);

    const fps = 20;
    const delta = 1 / fps;
    const frames = inPreWarmSeconds.get() * fps;

    for (let i = 0; i < frames; i++)
    {
        renderFrame(i * delta, delta * inSpeed.get());
        updateFrameStore();
        renderVelocity();
    }

    timer.setTime(inPreWarmSeconds.get());
    timer.update();
}

function renderFrame(time, timeDiff)
{
    cglframeStoreparticleSys.time = time;
    cglframeStoreparticleSys.timeDiff = timeDiff;
    cglframeStoreparticleSys.reset = uniReset.getValue();

    outTime.set(time);
    uniTimeParams.setValue([time, timeDiff, inSpawnRate.get(), inSpawnEnergy.get()]);

    cgl.pushBlend(false);

    ps.bgShader.popTextures();

    if (!tcFeedback)tcFeedback = new CGL.CopyTexture(op.patch.cgl, "particlesys_feedback", { "pixelFormat": getPixelFormat(), "filter": CGL.Texture.FILTER_NEAREST });
    ps.bgShader.pushTexture(uniTexOldPos, tcFeedback.copy(outTexPos.get()));

    if (inTexLifeTime.get()) ps.bgShader.pushTexture(uniTexLifetime, inTexLifeTime.get().tex || texBlack.tex);

    if (inTexMass.get()) ps.bgShader.pushTexture(uniTexMass, inTexMass.get().tex || texBlack.tex);

    if (inTexPassThrough1.get()) ps.bgShader.pushTexture(uniPass1, inTexPassThrough1.get().tex || texBlack.tex);
    else ps.bgShader.pushTexture(uniPass1, texBlack.tex);

    if (inTexPassThrough2.get()) ps.bgShader.pushTexture(uniPass2, inTexPassThrough2.get().tex || texBlack.tex);
    else ps.bgShader.pushTexture(uniPass2, texBlack.tex);

    if (inTexSpawnDir.get()) ps.bgShader.pushTexture(uniTexSpawnDir, inTexSpawnDir.get().tex || texBlack.tex);
    else ps.bgShader.pushTexture(uniTexSpawnDir, CGL.Texture.getRandomFloatTexture(cgl));

    if (inTexSpawn.get()) ps.bgShader.pushTexture(uniTexSpawn, inTexSpawn.get().tex || texBlack.tex);
    else ps.bgShader.pushTexture(uniTexSpawn, CGL.Texture.getRandomFloatTexture(cgl));

    if (texVelocity) ps.bgShader.pushTexture(uniTexVel, texVelocity.tex || texBlack.tex);
    else ps.bgShader.pushTexture(uniTexVel, emptyTex);

    if (ps.fb)
    {
        if (!tcFeedbackVel) tcFeedbackVel = new CGL.CopyTexture(op.patch.cgl, "particlesys_feedbackvel", { "pixelFormat": getPixelFormat(), "filter": CGL.Texture.FILTER_NEAREST });
        ps.bgShader.pushTexture(uniTexFeedbackVel, tcFeedbackVel.copy(ps.fb.getTextureColorNum(3)));
    }

    if (ps.fb && ps.fb.getTextureColorNum(1))
    {
        if (!tcTiming) tcTiming = new CGL.CopyTexture(op.patch.cgl, "particlesys_timing", { "pixelFormat": getPixelFormat(), "filter": CGL.Texture.FILTER_NEAREST });
        ps.bgShader.pushTexture(uniTexTiming, tcTiming.copy(ps.fb.getTextureColorNum(1)));
    }

    if (ps.fb && ps.fb.getTextureColorNum(6))
    {
        if (!tcFbMisc) tcFbMisc = new CGL.CopyTexture(op.patch.cgl, "particlesys_misc", { "pixelFormat": getPixelFormat(), "filter": CGL.Texture.FILTER_NEAREST });
        ps.bgShader.pushTexture(unitexFeedbackMisc, tcFbMisc.copy(ps.fb.getTextureColorNum(6)));
    }

    ps.copy(texPos);

    outTexPos.setRef(ps.fb.getTextureColorNum(0));
    outTexTimingInt.setRef(ps.fb.getTextureColorNum(1));
    outTexTiming.setRef(ps.fb.getTextureColorNum(2));
    outVelocity.setRef(ps.fb.getTextureColorNum(3));
    outPassThrough1.setRef(ps.fb.getTextureColorNum(4));
    outAbsVelocity.setRef(ps.fb.getTextureColorNum(5));
    outMisc.setRef(ps.fb.getTextureColorNum(6));
    outPassThrough2.setRef(ps.fb.getTextureColorNum(7));

    cgl.popBlend();
}

// internal image compose...
let effect = null;
let imgCompTex = null;
let tcVelocity = null;

op.patch.on("patchLoadEnd", () =>
{
    if (!patchLoaded)
    {
        console.log("patchloadend", patchLoaded);
        patchLoaded = true;
        prewarm = true;
        firstTime = true;
    }
});

function initImgComp()
{
    if (effect)effect.dispose();
    if (imgCompTex)imgCompTex.delete();

    imgCompTex = new CGL.Texture(cgl,
        {
            "name": "particlesys_v7_" + op.id,
            "pixelFormat": thePixelFormat,
            "filter": CGL.Texture.FILTER_NEAREST,
            "width": texSize,
            "height": texSize
        });

    effect = new CGL.TextureEffect(cgl, { "name": op.name, "pixelFormat": thePixelFormat });
    effect.setSourceTexture(imgCompTex);

    if (tcVelocity)tcVelocity.dispose();
    tcVelocity = new CGL.CopyTexture(op.patch.cgl, "particlesys_feedback", { "pixelFormat": getPixelFormat(), "filter": CGL.Texture.FILTER_NEAREST });
}

function renderVelocity()
{
    if (!effect || imgCompTex.width != texSize) initImgComp();

    if (!velocityFeedback2)
    {
        velocityFeedback2 = new CGL.CopyTexture(op.patch.cgl, "velocity copy", {
            // "shader": attachments.velocity_feedback_frag,
            "pixelFormat": CGL.Texture.PFORMATSTR_RGBA32F,
            "filter": CGL.Texture.FILTER_LINEAR
        });
    }

    cgl.pushBlend(false);

    // updateResolution();

    const oldEffect = cgl.currentTextureEffect;
    cgl.currentTextureEffect = effect;
    effect.imgCompVer = 3;
    // effect.width =
    // effect.height = texSize;
    // effect.setSourceTexture(imgCompTex);

    // mat4.perspective(cgl.pMatrix, 45, 1, 0.1, 1100.0);
    // effect.setSourceTexture(imgCompTex);

    effect.startEffect(texPos, true);

    next.trigger();

    // last velocity layer is a feedback
    // uniTexOldPos = new CGL.Uniform(ps.bgShader, "t", "texOldPos", 6);

    if (!shaderDrag)
    {
        shaderDrag = new CGL.Shader(cgl, "psVelDragFeedback");
        shaderDrag.setSource(shaderDrag.getDefaultVertexShader(), attachments.velocity_feedback_frag);

        univelDrag = new CGL.Uniform(shaderDrag, "f", "velDrag", inVelocityDrag);
        const uni = new CGL.Uniform(shaderDrag, "t", "tex", 0);
        const uni2 = new CGL.Uniform(shaderDrag, "t", "texA", 1);
    }

    cgl.pushShader(shaderDrag);
    cgl.currentTextureEffect.bind();

    univelDrag.setValue(inVelocityDrag.get());
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    // cgl.setTexture(1, ps.fb.getTextureColorNum(3).tex);
    if (velocityFeedback2.fb)cgl.setTexture(1, velocityFeedback2.fb.getTextureColorNum(0).tex);
    else op.log("no fb tex");

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    effect.endEffect();

    // velocityFeedback2.copy(texVelocity);
    // velocityFeedback.setSize(texSize,texSize);

    // velocityFeedback.bgShader.popTextures();
    // velocityFeedback.bgShader.pushTexture(texVelFeedA, velocityFeedback2.fb.getTextureColorNum(0));
    // velocityFeedback.bgShader.pushTexture(texVelFeedB, effect.getCurrentSourceTexture());
    // velocityFeedback.copy(texVelocity);
    // texVelocity = velocityFeedback.fb.getTextureColorNum(0);

    texVelocity = effect.getCurrentSourceTexture();

    velocityFeedback2.copy(texVelocity);
    velocityFeedback2.setSize(texSize, texSize);

    cgl.currentTextureEffect = oldEffect;

    cgl.popViewPort();

    cgl.popBlend();
}

//
