const
    emptyTex = CGL.Texture.getEmptyTexture(op.patch.cgl),
    exec = op.inTrigger("Execute"),
    inPlay = op.inBool("Play", true),
    inReset = op.inTriggerButton("Reset"),

    inNumParticles = op.inInt("Num Particles", 10000),
    inSpeed = op.inFloat("Speed", 1),

    inSpawnRate = op.inFloatSlider("Spawn Rate", 1),

    inLifeTimeMin = op.inFloat("Min Lifetime", 0.5),
    inLifeTimeMax = op.inFloat("Max Lifetime", 2),
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

    inTexSpawn = op.inTexture("Spawn Positions"),

    inSpawnEnergy = op.inFloat("Spawn Energy", 3),
    inTexSpawnDir = op.inTexture("Spawn Directions"),

    inTexVelocity = op.inTexture("Velocity"),

    inherVel = op.inFloatSlider("Inherit Velocity", 0),
    inTexPassThrough1 = op.inTexture("Pass Through 1"),
    inTexPassThrough2 = op.inTexture("Pass Through 2"),

    inRespawn = op.inBool("Respawn", true),

    next = op.outTrigger("Next"),
    outTexPos = op.outTexture("Positions", emptyTex),
    outTexTiming = op.outTexture("Timing", emptyTex),

    outVelocity = op.outTexture("Feedback Velocity Out", emptyTex),

    outAbsVelocity = op.outTexture("Absolute Velocity", emptyTex),

    outPassThrough1 = op.outTexture("Result Pass Through 1", emptyTex),
    outPassThrough2 = op.outTexture("Result Pass Through 2", emptyTex),
    outTexSize = op.outNumber("Tex Size");

op.setPortGroup("Particle Properties", [inLifeTimeMax, inLifeTimeMin, inMassMax, inMass, inTexMass, inTexLifeTime]);
op.setPortGroup("Constant Velocity", [moveX, moveY, moveZ]);
op.setPortGroup("Gravity", [gravX, gravY, gravZ]);

let timer = new CABLES.Timer();
let lastX = 0;
let lastY = 0;
let lastZ = 0;
let texSlot = 0;
let texTiming = null;
let texPos = null;
let lastTime = CABLES.now();

timer.play();

const tcPos = new CGL.CopyTexture(op.patch.cgl, "particlesys_pos",
    {
        "shader": attachments.particle_frag,
        "vertexShader": attachments.particle_vert,
        "numRenderBuffers": 8,
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_NEAREST
    });

// only used when no input texture is given, just for simple systems...
const tcTiming = new CGL.CopyTexture(op.patch.cgl, "particlesys_timing", { "isFloatingPointTexture": true, "filter": CGL.Texture.FILTER_NEAREST });
const tcFbMisc = new CGL.CopyTexture(op.patch.cgl, "particlesys_misc", { "isFloatingPointTexture": true, "filter": CGL.Texture.FILTER_NEAREST });
const tcFeedback = new CGL.CopyTexture(op.patch.cgl, "particlesys_feedback", { "isFloatingPointTexture": true, "filter": CGL.Texture.FILTER_NEAREST });
const tcFeedbackVel = new CGL.CopyTexture(op.patch.cgl, "particlesys_feedbackvel", { "isFloatingPointTexture": true, "filter": CGL.Texture.FILTER_NEAREST });

const
    cgl = op.patch.cgl,
    uniTexOldPos = new CGL.Uniform(tcPos.bgShader, "t", "texOldPos", texSlot++),
    uniTexSpawn = new CGL.Uniform(tcPos.bgShader, "t", "texSpawnPos", texSlot++),
    uniTexTiming = new CGL.Uniform(tcPos.bgShader, "t", "texTiming", texSlot++),
    uniTexFeedbackVel = new CGL.Uniform(tcPos.bgShader, "t", "texFeedbackVel", texSlot++),
    unitexFeedbackMisc = new CGL.Uniform(tcPos.bgShader, "t", "texFeedbackMisc", texSlot++),
    uniTexVel = new CGL.Uniform(tcPos.bgShader, "t", "texVelocity", texSlot++),
    uniPass1 = new CGL.Uniform(tcPos.bgShader, "t", "texPassThrough1", texSlot++),
    uniPass2 = new CGL.Uniform(tcPos.bgShader, "t", "texPassThrough2", texSlot++),
    uniTexLifetime = new CGL.Uniform(tcPos.bgShader, "t", "texLifeTime", texSlot++),
    uniTexMass = new CGL.Uniform(tcPos.bgShader, "t", "texMass", texSlot++),
    uniTexSpawnDir = new CGL.Uniform(tcPos.bgShader, "t", "texSpawnDir", texSlot++),

    uniTimeParams = new CGL.Uniform(tcPos.bgShader, "4f", "paramsTime", 0, 0, 0, 0),
    uniModelMatrix = new CGL.Uniform(tcPos.bgShader, "m4", "outModelMatrix", []),
    uniLifeTime = new CGL.Uniform(tcPos.bgShader, "2f", "lifeTime", inLifeTimeMin, inLifeTimeMax),
    uniMass = new CGL.Uniform(tcPos.bgShader, "2f", "mass", inMass, inMassMax),
    uniVel = new CGL.Uniform(tcPos.bgShader, "4f", "velocity", moveX, moveY, moveZ, inherVel),
    unigrav = new CGL.Uniform(tcPos.bgShader, "3f", "gravity", gravX, gravY, gravZ),
    uniReset = new CGL.Uniform(tcPos.bgShader, "f", "reset", 0);

inReset.onTriggered = () =>
{
    uniReset.setValue(1);
};

inNumParticles.onChange = createTextures;

inRespawn.onChange =
    inTexLifeTime.onLinkChanged =
    inTexMass.onLinkChanged =
    inTexSpawnDir.onLinkChanged =
        updateDefines;

inMass.onChange =
    inMassMax.onChange =
    gravX.onChange =
    gravZ.onChange =
    gravY.onChange = updateUi;

const texBlack = new CGL.Texture(cgl,
    {
        "isFloatingPointTexture": true,
        "width": 8,
        "height": 8
    });

updateDefines();

function updateUi()
{
    if (!CABLES.UI) return;

    inSpawnEnergy.setUiAttribs({ "greyout": !inTexSpawnDir.isLinked() });
    inLifeTimeMin.setUiAttribs({ "greyout": inTexLifeTime.isLinked() });
    inLifeTimeMax.setUiAttribs({ "greyout": inTexLifeTime.isLinked() });

    inMass.setUiAttribs({ "greyout": inTexMass.isLinked() });
    inMassMax.setUiAttribs({ "greyout": inTexMass.isLinked() });

    if ((inMassMax.get() == 0 && inMass.get() == 0) && (gravX.get() != 0.0 || gravY.get() != 0.0 || gravZ.get() != 0.0))
        op.setUiError("maxxGravity", "particles should have a mass when setting gravity");
    else op.setUiError("maxxGravity", null);
}

function updateDefines()
{
    tcPos.bgShader.toggleDefine("HAS_TEX_LIFETIME", inTexLifeTime.isLinked());
    tcPos.bgShader.toggleDefine("HAS_TEX_MASS", inTexMass.isLinked());
    tcPos.bgShader.toggleDefine("HAS_TEX_SPAWNDIR", inTexSpawnDir.isLinked());

    tcPos.bgShader.toggleDefine("RESPAWN", inRespawn.get());

    updateUi();
}

function createTextures()
{
    const size = Math.ceil(Math.sqrt(inNumParticles.get()));
    outTexSize.set(size);

    texTiming = new CGL.Texture(cgl, {
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_NEAREST,
        "width": size,
        "height": size });
    texPos = new CGL.Texture(cgl, {
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_NEAREST,
        "width": size,
        "height": size });
}

inPlay.onChange = () =>
{
    if (inPlay.get()) timer.play();
    else timer.pause();
};

exec.onTriggered = () =>
{
    let firsttime = false;
    cgl.pushBlend(false);

    uniModelMatrix.setValue(cgl.mMatrix);

    if (!texTiming)
    {
        firsttime = true;
        createTextures();
        uniReset.setValue(1);
    }

    tcPos.bgShader.popTextures();

    timer.update();
    const time = timer.get();
    const timeDiff = (time - lastTime) * inSpeed.get();

    if (CABLES.UI)
    {
        if (inTexVelocity.get() && (
            inTexVelocity.get().width != outTexSize.get() ||
            inTexVelocity.get().height != outTexSize.get() ||
            inTexVelocity.get().textureType != outTexPos.get().textureType)) op.setUiError("wrongtexsize", "inTexVelocity has wrong size or format!", 0);
        else op.setUiError("wrongtexsize", null);
    }

    uniTimeParams.setValue([time, timeDiff, inSpawnRate.get(), inSpawnEnergy.get()]);
    lastTime = timer.get();// CABLES.now();

    if (firsttime)tcPos.bgShader.pushTexture(uniTexOldPos, texPos.tex);
    else tcPos.bgShader.pushTexture(uniTexOldPos, tcFeedback.copy(outTexPos.get()));

    if (inTexLifeTime.get()) tcPos.bgShader.pushTexture(uniTexLifetime, inTexLifeTime.get().tex || texBlack.tex);

    if (inTexMass.get()) tcPos.bgShader.pushTexture(uniTexMass, inTexMass.get().tex || texBlack.tex);

    if (inTexPassThrough1.get()) tcPos.bgShader.pushTexture(uniPass1, inTexPassThrough1.get().tex || texBlack.tex);
    else tcPos.bgShader.pushTexture(uniPass1, texBlack.tex);

    if (inTexPassThrough2.get()) tcPos.bgShader.pushTexture(uniPass2, inTexPassThrough2.get().tex || texBlack.tex);
    else tcPos.bgShader.pushTexture(uniPass2, texBlack.tex);

    if (inTexSpawnDir.get()) tcPos.bgShader.pushTexture(uniTexSpawnDir, inTexSpawnDir.get().tex || texBlack.tex);
    else tcPos.bgShader.pushTexture(uniTexSpawnDir, CGL.Texture.getRandomFloatTexture(cgl));

    if (inTexSpawn.get()) tcPos.bgShader.pushTexture(uniTexSpawn, inTexSpawn.get().tex || texBlack.tex);
    else tcPos.bgShader.pushTexture(uniTexSpawn, CGL.Texture.getRandomFloatTexture(cgl));

    if (inTexVelocity.get()) tcPos.bgShader.pushTexture(uniTexVel, inTexVelocity.get().tex || texBlack.tex);
    else tcPos.bgShader.pushTexture(uniTexVel, emptyTex);

    if (tcPos.fb) tcPos.bgShader.pushTexture(uniTexFeedbackVel, tcFeedbackVel.copy(tcPos.fb.getTextureColorNum(3)));

    if (firsttime)tcPos.bgShader.pushTexture(uniTexTiming, texTiming.tex);
    else
    if (tcPos.fb && tcPos.fb.getTextureColorNum(1))tcPos.bgShader.pushTexture(uniTexTiming, tcTiming.copy(tcPos.fb.getTextureColorNum(1)));

    if (tcPos.fb && tcPos.fb.getTextureColorNum(6))tcPos.bgShader.pushTexture(unitexFeedbackMisc, tcFbMisc.copy(tcPos.fb.getTextureColorNum(6)));

    tcPos.copy(texPos);

    uniReset.setValue(0);

    lastX = moveX.get();
    lastY = moveY.get();
    lastZ = moveZ.get();

    outTexPos.setRef(tcPos.fb.getTextureColorNum(0));
    outTexTiming.setRef(tcPos.fb.getTextureColorNum(2));
    outVelocity.setRef(tcPos.fb.getTextureColorNum(3));
    outPassThrough1.setRef(tcPos.fb.getTextureColorNum(4));
    outPassThrough2.setRef(tcPos.fb.getTextureColorNum(7));
    outAbsVelocity.setRef(tcPos.fb.getTextureColorNum(5));

    cgl.popBlend();
    next.trigger();
};

//
