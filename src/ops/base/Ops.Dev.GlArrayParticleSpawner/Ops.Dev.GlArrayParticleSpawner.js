const
    render = op.inTrigger("Render"),
    inTex = op.inTexture("GlArray"),

    inTexSpawns = op.inTexture("Spawn Coords"),
    inTexLifetimes = op.inTexture("Lifetimes"),

    scale = op.inValue("Scale", 1),
    inTime = op.inValue("Time", 1),
    inTimeMax = op.inValue("Max Lifetime", 4),

    inReset = op.inTriggerButton("Reset"),

    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),
    z = op.inValue("Z", 0),
    a = op.inValue("a", 1),

    trigger = op.outTrigger("trigger"),
    outTex = op.outTexture("Result"),
    outTexLife = op.outTexture("Life Progress");

render.onTriggered = dorender;

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
const texMath = new CGL.ShaderTextureMath(cgl, op.objName, { "texturePort": inTex });
const texMathLifeProg = new CGL.ShaderTextureMath(cgl, op.objName, { "texturePort": inTex });
const texMathLife = new CGL.ShaderTextureMath(cgl, op.objName, { "texturePort": inTex });

shader.setSource(shader.getDefaultVertexShader(), attachments.copytexture_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const unitexSpawns = new CGL.Uniform(shader, "t", "texSpawnCoords", 1);
const unitexLifetimes = new CGL.Uniform(shader, "t", "texLifetimes", 2);
const uniformTime = new CGL.Uniform(shader, "f", "time", inTime);
const uniformTimeMax = new CGL.Uniform(shader, "f", "timeMax", inTimeMax);

// const shaderLifeProg = new CGL.Shader(cgl, op.name);
// shaderLifeProg.setSource(shader.getDefaultVertexShader(), attachments.lifeProg_frag);
// const unitexLifeLifetimes = new CGL.Uniform(shader, "t", "texLifetimes", 0);

const shaderLife = new CGL.Shader(cgl, op.name);
shaderLife.setSource(shader.getDefaultVertexShader(), attachments.life_frag);
const unitexLifeLifetimes = new CGL.Uniform(shaderLife, "t", "texLife", 0);
const initexLifeTime1 = new CGL.Uniform(shaderLife, "t", "time", inTime);
const uniformTimeMax1 = new CGL.Uniform(shaderLife, "f", "timeMax", inTimeMax);

updateDefines();

let resetSpawns = true;

inReset.onTriggered = () =>
{
    resetSpawns = true;
};

function updateDefines()
{
}

function dorender()
{
    if (!inTex.get() || !inTexSpawns.get() || !inTexLifetimes.get())
    {
        resetSpawns = true;
    }

    // ---------------------

    // shaderLife.popTextures();

    // if (inTexLifetimes.get()) shaderLifeProg.pushTexture(unitexLifeLifetimes, inTexLifetimes.get().tex);
    // const lifeTex = texMathLifeProg.render(shaderLifeProg);

    // outTexLife.set(lifeTex);

    // ---------------------

    shaderLife.popTextures();

    if (inTexLifetimes.get()) shaderLife.pushTexture(unitexLifeLifetimes, inTexLifetimes.get().tex);
    const lifeTex = texMathLifeProg.render(shaderLife);

    outTexLife.set(lifeTex);

    // ---------------------

    shader.popTextures();

    if (resetSpawns)
    {
        inTex.set(inTexSpawns.get());
        resetSpawns = false;
    }

    if (inTex.get()) shader.pushTexture(textureUniform, inTex.get().tex);
    if (inTexSpawns.get()) shader.pushTexture(unitexSpawns, inTexSpawns.get().tex);
    if (lifeTex) shader.pushTexture(unitexLifetimes, lifeTex.tex);

    const finTex = texMath.render(shader);

    outTex.set(finTex);

    // ---------------------

    trigger.trigger();
}
