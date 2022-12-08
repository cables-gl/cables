// Author: action
// Based on Reaction-Diffusion Textures by Andrew Witkin and Michael Kassy
// and the GLSL implementation by Linus Mossberg

// OP
const
    exec = op.inTrigger("render"),
    reset = op.inTrigger("reset"),
    next = op.outTrigger("trigger");

let needReset = false;

const
    inVPSize = op.inBool("Use Viewport Size", true),
    inWidth = op.inInt("Width", 640),
    inHeight = op.inInt("Height", 480);

op.setPortGroup("Texture Size", [inVPSize, inWidth, inHeight]);

// Texture
const
    inTex = op.inTexture("Texture In"),
    outTex = op.outTexture("Texture Out");

let environment_noise_texture;

op.setPortGroup("Input Reaction", [inTex]);

let inputReaction = false;

// Simulation
const rdsSpeed = op.inInt("speed", 4); // 1 - 25

const rdsSeed = op.inFloat("Seed", 0, 0, 2000);

// RDS presets
const rdyMode = op.inDropDown("Presets", [
    "Default",
    "Zebra",
    "Fingerprints",
    "Worms",
    "Spots and Worms",
    "Cell Division",
    "Voronoi",
    "Maze",
    "Tensor",
    "Custom",
], "Default");

const rdyPresets = {
    "Default": {
        "feed": 0.044,
        "feed_variation": 0.001,
        "kill": 0.06,
        "kill_variation": 0.001,
        "diffusion_scale": 1.0,
        "diffusion_scale_variation": 0.375,
        "anisotropy": 0.8,
        "separate_fields": false,
        "environment_noise_scale": 250,
    },
    "Zebra": {
        "feed": 0.05,
        "feed_variation": 0.0,
        "kill": 0.061,
        "kill_variation": 0.0,
        "diffusion_scale": 0.25,
        "diffusion_scale_variation": 0.0,
        "anisotropy": 0.9,
        "separate_fields": true,
        "environment_noise_scale": 700,
    },
    "Fingerprints": {
        "feed": 0.037,
        "feed_variation": 0.0,
        "kill": 0.06,
        "kill_variation": 0.0,
        "diffusion_scale": 0.25,
        "diffusion_scale_variation": 0.0,
        "anisotropy": 0.8,
        "separate_fields": false,
        "environment_noise_scale": 250,
    },
    "Worms": {
        "feed": 0.058,
        "feed_variation": 0.0,
        "kill": 0.065,
        "kill_variation": 0.0,
        "diffusion_scale": 0.25,
        "diffusion_scale_variation": 0.125,
        "anisotropy": 0.5,
        "separate_fields": false,
        "environment_noise_scale": 250,
    },
    "Spots and Worms": {
        "feed": 0.034,
        "feed_variation": 0.0,
        "kill": 0.0618,
        "kill_variation": 0.0,
        "diffusion_scale": 0.25,
        "diffusion_scale_variation": 0.375,
        "anisotropy": 0.5,
        "separate_fields": false,
        "environment_noise_scale": 250,
    },
    "Cell Division": {
        "feed": 0.03,
        "feed_variation": 0.0,
        "kill": 0.063,
        "kill_variation": 0.0,
        "diffusion_scale": 0.625,
        "diffusion_scale_variation": 0.375,
        "anisotropy": 0.5,
        "separate_fields": false,
        "environment_noise_scale": 250,
    },
    "Voronoi": {
        "feed": 0.098,
        "feed_variation": 0.0,
        "kill": 0.0555,
        "kill_variation": 0.0,
        "diffusion_scale": 0.25,
        "diffusion_scale_variation": 0.0,
        "anisotropy": 0.8,
        "separate_fields": false,
        "environment_noise_scale": 250,
    },
    "Maze": {
        "feed": 0.03,
        "feed_variation": 0.0,
        "kill": 0.0565,
        "kill_variation": 0.0,
        "diffusion_scale": 0.25,
        "diffusion_scale_variation": 0.0625,
        "anisotropy": 0.5,
        "separate_fields": false,
        "environment_noise_scale": 250,
    },
    "Tensor": {
        "feed": 0.03,
        "feed_variation": 0.0,
        "kill": 0.063,
        "kill_variation": 0.0,
        "diffusion_scale": 0.375,
        "diffusion_scale_variation": 0.25,
        "anisotropy": 0.9,
        "separate_fields": false,
        "environment_noise_scale": 250,
    },
};

// Sim Values
const rdsFeed = op.inValueSlider("feed", rdyPresets.Default.feed, 0.01, 0.12);
const rdsFeedVariation = op.inValueSlider("feed variation", rdyPresets.Default.feed_variation, 0, 0.01);

op.setPortGroup("Feed", [rdsFeed, rdsFeedVariation]);

const rdsKill = op.inValueSlider("kill", rdyPresets.Default.kill, 0.01, 0.12);
const rdsKillVariation = op.inValueSlider("kill variation", rdyPresets.Default.kill_variation, 0, 0.01);

op.setPortGroup("Kill", [rdsKill, rdsKillVariation]);

const rdsDiffScale = op.inValueSlider("diffusion scale", rdyPresets.Default.diffusion_scale, 0.12, 2.5);
const rdsDiffScaleVariation = op.inValueSlider("diffusion scale variation", rdyPresets.Default.diffusion_scale_variation, 0, 0.5);

op.setPortGroup("Diffusion Scale", [rdsDiffScale, rdsDiffScaleVariation]);

const rdsAnisotropy = op.inValueSlider("anisotropy", rdyPresets.Default.anisotropy, 0.1, 0.9);
const rdsNoiseScale = op.inValueSlider("Noise Scale", rdyPresets.Default.environment_noise_scale, 1.0, 1000.0);
const rdsSepFields = op.inBool("separate Fields", rdyPresets.Default.separate_fields);

op.setPortGroup("Environment", [rdsAnisotropy, rdsNoiseScale, rdsSepFields]);

op.setPortGroup("Simulation", [rdsSpeed, rdsSeed]);

// Render
const cgl = op.patch.cgl;

let prevViewPort = [0, 0, 0, 0];

// FBO
let fb = null;
let fbNeedInit = true;

const mesh = CGL.MESHES.getSimpleRect(cgl, "shader2texture rect");

// Create RD shader
const shader = new CGL.Shader(cgl, "reactiondiffusion");
// shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
// shader.setSource(attachments.rdf_vert, attachments.rdf_frag);
shader.setSource(shader.getDefaultVertexShader(), attachments.rdf_frag);

// Set uniforms
const rdsFeedUni = new CGL.Uniform(shader, "f", "feed", rdsFeed);
const rdsKillUni = new CGL.Uniform(shader, "f", "kill", rdsKill);
const rdsDiffScaleUni = new CGL.Uniform(shader, "f", "diffusion_scale", rdsDiffScale);

const rdsFeedVariationUni = new CGL.Uniform(shader, "f", "feed_variation", rdsFeedVariation);
const rdsKillVariationUni = new CGL.Uniform(shader, "f", "kill_variation", rdsKillVariation);
const rdsdiffScaleVariationUni = new CGL.Uniform(shader, "f", "diffusion_scale_variation", rdsDiffScaleVariation);

const rdsAnisotropyUni = new CGL.Uniform(shader, "f", "anisotropy", rdsAnisotropy);
const rdsSepFieldsUni = new CGL.Uniform(shader, "b", "separate_fields", rdsSepFields);

// const rdsNoiseScaleUni = new CGL.Uniform(shader, "f", "noise_scale", rdsNoiseScale);

const rdsResetUni = new CGL.Uniform(shader, "b", "reset", false);
const rdsInputReactionUni = new CGL.Uniform(shader, "b", "input_reaction", false);
const rdsInputReactionTextureUni = new CGL.Uniform(shader, "t", "input_reaction_texture", 1);
const rdsNoiseTextureUni = new CGL.Uniform(shader, "t", "input_noise_texture", 2);

const rdsResolutionUni = new CGL.Uniform(shader, "2f", "resolution", 500, 500);

// UI triggers
inVPSize.onChange = updateUi;
inWidth.onChange = inHeight.onChange = initFbLater;
rdyMode.onChange = setRDSPressetValues;
rdsNoiseScale.onValueChanged = updateNoise;
updateUi();

function setRDSPressetValues()
{
    let presset = rdyPresets[rdyMode.get()];

    if (presset === undefined)
    {
        rdsFeed.setUiAttribs({ "greyout": false });
        rdsFeedVariation.setUiAttribs({ "greyout": false });
        rdsKill.setUiAttribs({ "greyout": false });
        rdsKillVariation.setUiAttribs({ "greyout": false });
        rdsDiffScale.setUiAttribs({ "greyout": false });
        rdsDiffScaleVariation.setUiAttribs({ "greyout": false });
        rdsAnisotropy.setUiAttribs({ "greyout": false });
        rdsSepFields.setUiAttribs({ "greyout": false });
        rdsNoiseScale.setUiAttribs({ "greyout": false });
    }
    else
    {
        rdsFeed.setUiAttribs({ "greyout": true });
        rdsFeedVariation.setUiAttribs({ "greyout": true });
        rdsKill.setUiAttribs({ "greyout": true });
        rdsKillVariation.setUiAttribs({ "greyout": true });
        rdsDiffScale.setUiAttribs({ "greyout": true });
        rdsDiffScaleVariation.setUiAttribs({ "greyout": true });
        rdsAnisotropy.setUiAttribs({ "greyout": true });
        rdsSepFields.setUiAttribs({ "greyout": true });
        rdsNoiseScale.setUiAttribs({ "greyout": true });

        rdsFeed.set(presset.feed);
        rdsFeedVariation.set(presset.feed_variation);
        rdsKill.set(presset.kill);
        rdsKillVariation.set(presset.kill_variation);
        rdsDiffScale.set(presset.diffusion_scale);
        rdsDiffScaleVariation.set(presset.diffusion_scale_variation);
        rdsAnisotropy.set(presset.anisotropy);
        rdsSepFields.set(presset.separate_fields);
        rdsNoiseScale.set(presset.environment_noise_scale);
    }
}

function updateUi()
{
    inWidth.setUiAttribs({ "greyout": inVPSize.get() });
    inHeight.setUiAttribs({ "greyout": inVPSize.get() });

    // updateResolutionInfo();
    initFbLater();
}

function initFbLater()
{
    fbNeedInit = true;
}

function initFb()
{
    fbNeedInit = false;
    if (fb)fb.delete();
    fb = null;

    let width = Math.ceil(inWidth.get());
    let height = Math.ceil(inHeight.get());

    let filter = CGL.Texture.FILTER_LINEAR;

    let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    if (inVPSize.get())
    {
        width = cgl.getViewPort()[2]; // cgl.canvasWidth
        height = cgl.getViewPort()[3]; // cgl.canvasHeight
        inWidth.set(width);
        inHeight.set(height);
    }

    if (cgl.glVersion >= 2)
    {
        fb = new CGL.Framebuffer2(cgl, width, height,
            {
                "isFloatingPointTexture": true, // important
                "multisampling": false,
                "wrap": selectedWrap,
                "filter": filter,
                "depth": false,
                "multisamplingSamples": 0,
                "clear": true
            });
    }

    else
    {
        fb = new CGL.Framebuffer(cgl, inWidth.get(), inHeight.get(),
            {
                "isFloatingPointTexture": true,
                "filter": filter,
                "wrap": selectedWrap
            });
    }

    needReset = true;

    updateNoise();
}

function updateNoise()
{
    let width = Math.ceil(inWidth.get());
    let height = Math.ceil(inHeight.get());

    if (inVPSize.get())
    {
        width = cgl.getViewPort()[2];
        height = cgl.getViewPort()[3];
    }

    const num = width * 4 * height;

    Math.randomSeed = rdsSeed.get();

    let invScale = 1.0 / rdsNoiseScale.get();
    let offsets = [0, 1, 2].map((i) => { return (i + Math.random()) * 1000; });

    let pixels = new Float32Array(num);

    for (let i = 0; i < num; i += 4)
    {
        pixels[i + 0] = Math.random(i * invScale + offsets[0]);
        pixels[i + 1] = Math.random(i * invScale + offsets[1]);
        pixels[i + 2] = Math.random(i * invScale + offsets[2]);
        pixels[i + 3] = 1.0;
    }

    let cgl_filter = CGL.Texture.FILTER_NEAREST;
    let cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    environment_noise_texture = new CGL.Texture(cgl, { "isFloatingPointTexture": true });

    environment_noise_texture.initFromData(pixels, width, height, cgl_filter, cgl_wrap);
}

inTex.onChange = function ()
{
    rdsInputReactionUni.setValue(true);
};

function doRenderStep(intexture, i)
{
    fb.renderStart(cgl);

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);
    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);
    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.setTexture(0, intexture);

    // attach input reaction texture
    if (inTex.get())
        cgl.setTexture(1, inTex.get().tex);
    else
        rdsInputReactionUni.setValue(false);

    mesh.render(shader);

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();

    // rdsResetUni.updateValueBool(needReset)
    rdsResetUni.setValue(needReset);

    fb.renderEnd(cgl);

    if (i === 0 && needReset)
        needReset = false;
    if (i === 0 && rdsInputReactionUni.getValue())
        rdsInputReactionUni.setValue(false);

    return fb.getTextureColor();
}

exec.onTriggered = function ()
{
    if (!shader) return;

    const vp = cgl.getViewPort();
    if (!fb || fbNeedInit) initFb();
    if (inVPSize.get() && fb && (vp[2] != fb.getTextureColor().width || vp[3] != fb.getTextureColor().height))
        initFb();

    prevViewPort[0] = vp[0];
    prevViewPort[1] = vp[1];
    prevViewPort[2] = vp[2];
    prevViewPort[3] = vp[3];

    cgl.pushShader(shader);

    // update resolution
    rdsResolutionUni.setValue(
        inVPSize.get() ? [cgl.canvasWidth, cgl.canvasHeight] : [inWidth.get(), inHeight.get()]
    );

    // update noise texture
    cgl.setTexture(2, environment_noise_texture.tex);

    let swapTexture, sourceTexture = fb.getTextureColor();
    for (let i = 0; i < Math.min(25, Math.max(1, rdsSpeed.get())); i++)
    {
        swapTexture = doRenderStep(sourceTexture.tex, i);
        sourceTexture = swapTexture;
    }

    cgl.popShader();

    cgl.gl.viewport(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    outTex.set(swapTexture);

    next.trigger();
};

reset.onTriggered = function ()
{
    needReset = true;
};
