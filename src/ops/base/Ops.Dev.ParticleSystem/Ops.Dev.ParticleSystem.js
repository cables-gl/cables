const
    emptyTex = CGL.Texture.getEmptyTexture(op.patch.cgl),
    exec = op.inTrigger("Execute"),
    inNumParticles = op.inInt("Num Particles", 10000),
    inReset = op.inTriggerButton("Reset"),

    // inTime=op.inFloat("Time",0),
    inLifeTimeMin = op.inFloat("Min Lifetime", 0.5),
    inLifeTimeMax = op.inFloat("Max Lifetime", 2),

    posX = op.inFloatSlider("Position X", 0),
    posY = op.inFloatSlider("Position Y", 0),
    posZ = op.inFloatSlider("Position Z", 0),

    moveX = op.inFloatSlider("Velocity X", 0),
    moveY = op.inFloatSlider("Velocity Y", 1),
    moveZ = op.inFloatSlider("Velocity Z", 0),

    inherVel = op.inFloatSlider("Inherit Velocity", 0),

    inTexOldPos = op.inTexture("Feedback Positions"),
    inTexSpawn = op.inTexture("Spawn Positions"),
    inTexSpawnVel = op.inTexture("Spawn Velocity"),

    next = op.outTrigger("Next"),
    outTexPos = op.outTexture("Positions", emptyTex),
    outTexTiming = op.outTexture("Timing", emptyTex),
    outTest = op.outTexture("Test", emptyTex),
    outTexSize = op.outNumber("Tex Size");

op.setPortGroup("Constant Velocity", [moveX, moveY, moveZ]);
op.setPortGroup("Position", [posX, posY, posZ]);

let lastX = 0;
let lastY = 0;
let lastZ = 0;

let texTiming = null;
let texPos = null;
let lastTime = CABLES.now();

const tcPos = new CGL.CopyTexture(op.patch.cgl, "particlesys_pos",
    {
        "shader": attachments.particle_frag,
        "numRenderBuffers": 4,
        "isFloatingPointTexture": true
    });

const tcTiming = new CGL.CopyTexture(op.patch.cgl, "particlesys_timing", { "isFloatingPointTexture": true });

// only used when no input texture is given, just for simple systems...
const tcFeedback = new CGL.CopyTexture(op.patch.cgl, "particlesys_feedback", { "isFloatingPointTexture": true });
const tcFeedbackVel = new CGL.CopyTexture(op.patch.cgl, "particlesys_feedbackvel", { "isFloatingPointTexture": true });

const
    cgl = op.patch.cgl,
    uniTexOldPos = new CGL.Uniform(tcPos.bgShader, "t", "texOldPos", 0),
    uniTexSpawn = new CGL.Uniform(tcPos.bgShader, "t", "texSpawnPos", 1),
    uniTexTiming = new CGL.Uniform(tcPos.bgShader, "t", "texTiming", 2),
    uniTexSpawnVel = new CGL.Uniform(tcPos.bgShader, "t", "texSpawnVel", 3),
    uniTexFeedbackVel = new CGL.Uniform(tcPos.bgShader, "t", "texFeedbackVel", 4),

    uniTime = new CGL.Uniform(tcPos.bgShader, "f", "time", 0),
    uniLifeTime = new CGL.Uniform(tcPos.bgShader, "2f", "lifeTime", inLifeTimeMin, inLifeTimeMax),
    uniTimeDiff = new CGL.Uniform(tcPos.bgShader, "f", "timeDiff", 0),

    uniVel = new CGL.Uniform(tcPos.bgShader, "4f", "velocity", moveX, moveY, moveZ, inherVel),
    uniPos = new CGL.Uniform(tcPos.bgShader, "3f", "pos", posX, posY, posZ),

    uniReset = new CGL.Uniform(tcPos.bgShader, "f", "reset", 0);

inReset.onTriggered = () =>
{
    uniReset.setValue(1);
};

inNumParticles.onChange = createTextures;

const texBlack = new CGL.Texture(cgl, {
    "isFloatingPointTexture": true,
    "width": 8,
    "height": 8 });

function createTextures()
{
    const size = Math.ceil(Math.sqrt(inNumParticles.get()));
    outTexSize.set(size);

    console.log(size);

    texTiming = new CGL.Texture(cgl, {
        "isFloatingPointTexture": true,
        "width": size,
        "height": size });
    texPos = new CGL.Texture(cgl, {
        "isFloatingPointTexture": true,
        "width": size,
        "height": size });
}

exec.onTriggered = () =>
{
    let firsttime = false;
    // if (!inTexOldPos.get()) return;
    if (!texTiming)
    {
        firsttime = true;
        createTextures();
        uniReset.setValue(1);
    }

    tcPos.bgShader.popTextures();

    uniTime.setValue(op.patch.freeTimer.get());

    if (!inTexOldPos.isLinked())
    {

    }

    if (firsttime)tcPos.bgShader.pushTexture(uniTexOldPos, texPos.tex);
    else
    {
        if (inTexOldPos.isLinked())
            tcPos.bgShader.pushTexture(uniTexOldPos, inTexOldPos.get().tex);
        else
            tcPos.bgShader.pushTexture(uniTexOldPos, tcFeedback.copy(outTexPos.get()));
    }

    if (inTexSpawn.get()) tcPos.bgShader.pushTexture(uniTexSpawn, inTexSpawn.get().tex);
    else tcPos.bgShader.pushTexture(uniTexSpawn, texBlack.tex);

    if (inTexSpawnVel.get()) tcPos.bgShader.pushTexture(uniTexSpawnVel, inTexSpawnVel.get().tex);

    if (tcPos.fb) tcPos.bgShader.pushTexture(uniTexFeedbackVel, tcFeedbackVel.copy(tcPos.fb.getTextureColorNum(3)));

    if (firsttime)tcPos.bgShader.pushTexture(uniTexTiming, texTiming.tex);
    else
    if (tcPos.fb && tcPos.fb.getTextureColorNum(1))tcPos.bgShader.pushTexture(uniTexTiming, tcTiming.copy(tcPos.fb.getTextureColorNum(1)));

    tcPos.copy(texPos);

    uniReset.setValue(0);

    uniTimeDiff.setValue((CABLES.now() - lastTime) / 1000);
    lastTime = CABLES.now();

    lastX = moveX.get();
    lastY = moveY.get();
    lastZ = moveZ.get();

    outTexPos.set(emptyTex);
    outTexPos.set(tcPos.fb.getTextureColorNum(0));

    outTexTiming.set(emptyTex);
    outTexTiming.set(tcPos.fb.getTextureColorNum(2));

    outTest.set(texPos);
    outTest.set(tcPos.fb.getTextureColorNum(3));

    next.trigger();
};

//
