const cgl = op.patch.cgl;

const attachmentFragmentHead = attachments.snippet_head_frag;
const snippets = {
    "point": attachments.snippet_body_point_frag,
    "spot": attachments.snippet_body_spot_frag,
    "ambient": attachments.snippet_body_ambient_frag,
    "directional": attachments.snippet_body_directional_frag,
    "area": attachments.snippet_body_area_frag,
};
const LIGHT_INDEX_REGEX = new RegExp("{{LIGHT_INDEX}}", "g");

const createFragmentHead = (n) => { return attachmentFragmentHead.replace("{{LIGHT_INDEX}}", n); };
const createFragmentBody = (n, type) => { return snippets[type].replace(LIGHT_INDEX_REGEX, n); };

function createDefaultShader()
{
    const vertexShader = attachments.phong_vert;
    let fragmentShader = attachments.phong_frag;

    let fragmentHead = createFragmentHead(0);
    let fragmentBody = createFragmentBody(0, DEFAULT_LIGHTSTACK[0].type);

    fragmentShader = fragmentShader.replace(FRAGMENT_HEAD_REGEX, fragmentHead);
    fragmentShader = fragmentShader.replace(FRAGMENT_BODY_REGEX, fragmentBody);

    shader.setSource(vertexShader, fragmentShader);
    shader.define("HAS_POINT");
    shader.removeDefine("HAS_SPOT");
    shader.removeDefine("HAS_DIRECTIONAL");
    shader.removeDefine("HAS_AMBIENT");
}

const inTrigger = op.inTrigger("Trigger In");

// * DIFFUSE *
const inDiffuseR = op.inFloat("R", Math.random());
const inDiffuseG = op.inFloat("G", Math.random());
const inDiffuseB = op.inFloat("B", Math.random());
const inDiffuseA = op.inFloatSlider("A", 1);
const diffuseColors = [inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA];
op.setPortGroup("Diffuse Color", diffuseColors);

const inToggleOrenNayar = op.inBool("Enable", false);
const inAlbedo = op.inFloatSlider("Albedo", 0.707);
const inRoughness = op.inFloatSlider("Roughness", 0.835);

inToggleOrenNayar.setUiAttribs({ "hidePort": true });
inAlbedo.setUiAttribs({ "greyout": true });
inRoughness.setUiAttribs({ "greyout": true });
inDiffuseR.setUiAttribs({ "colorPick": true });
op.setPortGroup("Oren-Nayar Diffuse", [inToggleOrenNayar, inAlbedo, inRoughness]);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

inToggleOrenNayar.onChange = function ()
{
    shader.toggleDefine("ENABLE_OREN_NAYAR_DIFFUSE", inToggleOrenNayar);
    inAlbedo.setUiAttribs({ "greyout": !inToggleOrenNayar.get() });
    inRoughness.setUiAttribs({ "greyout": !inToggleOrenNayar.get() });
};

// * FRESNEL *
const inToggleFresnel = op.inValueBool("Active", false);
inToggleFresnel.setUiAttribs({ "hidePort": true });
const inFresnel = op.inValueSlider("Fresnel Intensity", 0.7);
const inFresnelWidth = op.inFloat("Fresnel Width", 1);
const inFresnelExponent = op.inFloat("Fresnel Exponent", 6);
const inFresnelR = op.inFloat("Fresnel R", 1);
const inFresnelG = op.inFloat("Fresnel G", 1);
const inFresnelB = op.inFloat("Fresnel B", 1);
inFresnelR.setUiAttribs({ "colorPick": true });

const fresnelArr = [inFresnel, inFresnelWidth, inFresnelExponent, inFresnelR, inFresnelG, inFresnelB];
fresnelArr.forEach(function (port) { port.setUiAttribs({ "greyout": true }); });
op.setPortGroup("Fresnel", fresnelArr.concat([inToggleFresnel]));

let uniFresnel = null;
let uniFresnelWidthExponent = null;
inToggleFresnel.onChange = function ()
{
    shader.toggleDefine("ENABLE_FRESNEL", inToggleFresnel);
    if (inToggleFresnel.get())
    {
        if (!uniFresnel) uniFresnel = new CGL.Uniform(shader, "4f", "inFresnel", inFresnelR, inFresnelG, inFresnelB, inFresnel);
        if (!uniFresnelWidthExponent) uniFresnelWidthExponent = new CGL.Uniform(shader, "2f", "inFresnelWidthExponent", inFresnelWidth, inFresnelExponent);
    }
    else
    {
        if (uniFresnel)
        {
            shader.removeUniform("inFresnel");
            uniFresnel = null;
        }

        if (uniFresnelWidthExponent)
        {
            shader.removeUniform("inFresnelWidthExponent");
            uniFresnelWidthExponent = null;
        }
    }

    fresnelArr.forEach(function (port) { port.setUiAttribs({ "greyout": !inToggleFresnel.get() }); });
};
// * EMISSIVE *
const inEmissiveActive = op.inBool("Emissive Active", false);
const inEmissiveColorIntensity = op.inFloatSlider("Color Intensity", 0.3);
const inEmissiveR = op.inFloatSlider("Emissive R", Math.random());
const inEmissiveG = op.inFloatSlider("Emissive G", Math.random());
const inEmissiveB = op.inFloatSlider("Emissive B", Math.random());
inEmissiveR.setUiAttribs({ "colorPick": true });
op.setPortGroup("Emissive Color", [inEmissiveActive, inEmissiveColorIntensity, inEmissiveR, inEmissiveG, inEmissiveB]);

inEmissiveColorIntensity.setUiAttribs({ "greyout": !inEmissiveActive.get() });
inEmissiveR.setUiAttribs({ "greyout": !inEmissiveActive.get() });
inEmissiveG.setUiAttribs({ "greyout": !inEmissiveActive.get() });
inEmissiveB.setUiAttribs({ "greyout": !inEmissiveActive.get() });

let uniEmissiveColor = null;

inEmissiveActive.onChange = () =>
{
    shader.toggleDefine("ADD_EMISSIVE_COLOR", inEmissiveActive);

    if (inEmissiveActive.get())
    {
        uniEmissiveColor = new CGL.Uniform(shader, "4f", "inEmissiveColor", inEmissiveR, inEmissiveG, inEmissiveB, inEmissiveColorIntensity);
        inEmissiveTexture.setUiAttribs({ "greyout": false });
        inEmissiveMaskTexture.setUiAttribs({ "greyout": false });

        if (inEmissiveTexture.get()) inEmissiveIntensity.setUiAttribs({ "greyout": false });
        if (inEmissiveMaskTexture.get()) inEmissiveMaskIntensity.setUiAttribs({ "greyout": false });
    }
    else
    {
        op.log("ayayay");
        inEmissiveTexture.setUiAttribs({ "greyout": true });
        inEmissiveMaskTexture.setUiAttribs({ "greyout": true });
        inEmissiveIntensity.setUiAttribs({ "greyout": true });
        inEmissiveMaskIntensity.setUiAttribs({ "greyout": true });

        shader.removeUniform("inEmissiveColor");
        uniEmissiveColor = null;
    }

    if (inEmissiveTexture.get())
    {
        inEmissiveColorIntensity.setUiAttribs({ "greyout": true });
        inEmissiveR.setUiAttribs({ "greyout": true });
        inEmissiveG.setUiAttribs({ "greyout": true });
        inEmissiveB.setUiAttribs({ "greyout": true });
    }
    else
    {
        if (inEmissiveActive.get())
        {
            inEmissiveColorIntensity.setUiAttribs({ "greyout": false });
            inEmissiveR.setUiAttribs({ "greyout": false });
            inEmissiveG.setUiAttribs({ "greyout": false });
            inEmissiveB.setUiAttribs({ "greyout": false });
        }
        else
        {
            inEmissiveColorIntensity.setUiAttribs({ "greyout": true });
            inEmissiveR.setUiAttribs({ "greyout": true });
            inEmissiveG.setUiAttribs({ "greyout": true });
            inEmissiveB.setUiAttribs({ "greyout": true });
        }
    }
};
// * SPECULAR *
const inShininess = op.inFloat("Shininess", 4);
const inSpecularCoefficient = op.inFloatSlider("Specular Amount", 0.5);
const inSpecularMode = op.inSwitch("Specular Model", ["Blinn", "Schlick", "Phong", "Gauss"], "Blinn");

inSpecularMode.setUiAttribs({ "hidePort": true });
const specularColors = [inShininess, inSpecularCoefficient, inSpecularMode];
op.setPortGroup("Specular", specularColors);

// * LIGHT *
const inEnergyConservation = op.inValueBool("Energy Conservation", false);
const inToggleDoubleSided = op.inBool("Double Sided Material", false);
const inFalloffMode = op.inSwitch("Falloff Mode", ["A", "B", "C", "D"], "A");
inEnergyConservation.setUiAttribs({ "hidePort": true });
inToggleDoubleSided.setUiAttribs({ "hidePort": true });
inFalloffMode.setUiAttribs({ "hidePort": true });
inFalloffMode.onChange = () =>
{
    const MODES = ["A", "B", "C", "D"];
    shader.define("FALLOFF_MODE_" + inFalloffMode.get());
    MODES.filter((mode) => { return mode !== inFalloffMode.get(); })
        .forEach((mode) => { return shader.removeDefine("FALLOFF_MODE_" + mode); });
};

const lightProps = [inEnergyConservation, inToggleDoubleSided, inFalloffMode];
op.setPortGroup("Light Options", lightProps);

// TEXTURES
const inDiffuseTexture = op.inTexture("Diffuse Texture");
const inSpecularTexture = op.inTexture("Specular Texture");
const inNormalTexture = op.inTexture("Normal Map");
const inAoTexture = op.inTexture("AO Texture");
const inEmissiveTexture = op.inTexture("Emissive Texture");
const inEmissiveMaskTexture = op.inTexture("Emissive Mask");
const inAlphaTexture = op.inTexture("Opacity Texture");
const inEnvTexture = op.inTexture("Environment Map");
const inLuminanceMaskTexture = op.inTexture("Env Map Mask");
op.setPortGroup("Textures", [inDiffuseTexture, inSpecularTexture, inNormalTexture, inAoTexture, inEmissiveTexture, inEmissiveMaskTexture, inAlphaTexture, inEnvTexture, inLuminanceMaskTexture]);

// TEXTURE TRANSFORMS
const inColorizeTexture = op.inBool("Colorize Texture", false);
const inDiffuseRepeatX = op.inFloat("Diffuse Repeat X", 1);
const inDiffuseRepeatY = op.inFloat("Diffuse Repeat Y", 1);
const inTextureOffsetX = op.inFloat("Texture Offset X", 0);
const inTextureOffsetY = op.inFloat("Texture Offset Y", 0);

const inSpecularIntensity = op.inFloatSlider("Specular Intensity", 1);
const inNormalIntensity = op.inFloatSlider("Normal Map Intensity", 0.5);
const inAoIntensity = op.inFloatSlider("AO Intensity", 1);
const inAoChannel = op.inSwitch("AO UV Channel", ["1", "2"], 1);
const inEmissiveIntensity = op.inFloatSlider("Emissive Intensity", 1);
const inEmissiveMaskIntensity = op.inFloatSlider("Emissive Mask Intensity", 1);
const inEnvMapIntensity = op.inFloatSlider("Env Map Intensity", 1);
const inEnvMapBlend = op.inSwitch("Env Map Blend", ["Add", "Multiply", "Mix"], "Add");
const inLuminanceMaskIntensity = op.inFloatSlider("Env Mask Intensity", 1);

inColorizeTexture.setUiAttribs({ "hidePort": true });
op.setPortGroup("Texture Transforms", [inColorizeTexture, inDiffuseRepeatY, inDiffuseRepeatX, inTextureOffsetY, inTextureOffsetX]);
op.setPortGroup("Texture Intensities", [inNormalIntensity, inAoIntensity, inSpecularIntensity, inEmissiveIntensity, inEnvMapBlend, inEmissiveMaskIntensity, inEnvMapIntensity, inLuminanceMaskIntensity]);
const alphaMaskSource = op.inSwitch("Alpha Mask Source", ["Luminance", "R", "G", "B", "A"], "Luminance");
alphaMaskSource.setUiAttribs({ "greyout": true });

const discardTransPxl = op.inValueBool("Discard Transparent Pixels");
discardTransPxl.setUiAttribs({ "hidePort": true });

op.setPortGroup("Opacity Texture", [alphaMaskSource, discardTransPxl]);

inAoChannel.onChange =
    inEnvMapBlend.onChange =
    alphaMaskSource.onChange = updateDefines;

const outTrigger = op.outTrigger("Trigger Out");
const shaderOut = op.outObject("Shader", null, "shader");
shaderOut.ignoreValueSerialize = true;

const shader = new CGL.Shader(cgl, "phongmaterial_" + op.id, this);
shader.op = this;
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG", "MODULE_BASE_COLOR", "MODULE_VERTEX_MODELVIEW"]);
shader.setSource(attachments.simosphong_vert, attachments.simosphong_frag);
// let recompileShader = false;
shader.define("FALLOFF_MODE_A");

if (cgl.glVersion < 2)
{
    shader.enableExtension("GL_OES_standard_derivatives");

    if (cgl.enableExtension("OES_texture_float")) shader.enableExtension("GL_OES_texture_float");
    else op.log("error loading extension OES_texture_float");

    if (cgl.enableExtension("OES_texture_float_linear")) shader.enableExtension("GL_OES_texture_float_linear");
    else op.log("error loading extention OES_texture_float_linear");

    if (cgl.enableExtension("GL_OES_texture_half_float")) shader.enableExtension("GL_OES_texture_half_float");
    else op.log("error loading extention GL_OES_texture_half_float");

    if (cgl.enableExtension("GL_OES_texture_half_float_linear")) shader.enableExtension("GL_OES_texture_half_float_linear");
    else op.log("error loading extention GL_OES_texture_half_float_linear");
}

const FRAGMENT_HEAD_REGEX = new RegExp("{{PHONG_FRAGMENT_HEAD}}", "g");
const FRAGMENT_BODY_REGEX = new RegExp("{{PHONG_FRAGMENT_BODY}}", "g");

const hasLight = {
    "directional": false,
    "spot": false,
    "ambient": false,
    "point": false,
};

function createShader(lightStack)
{
    let fragmentShader = attachments.phong_frag;

    let fragmentHead = "";
    let fragmentBody = "";

    hasLight.directional = false;
    hasLight.spot = false;
    hasLight.ambient = false;
    hasLight.point = false;

    for (let i = 0; i < lightStack.length; i += 1)
    {
        const light = lightStack[i];

        const type = light.type;

        if (!hasLight[type])
        {
            hasLight[type] = true;
        }

        fragmentHead = fragmentHead.concat(createFragmentHead(i));
        fragmentBody = fragmentBody.concat(createFragmentBody(i, light.type));
    }

    fragmentShader = fragmentShader.replace(FRAGMENT_HEAD_REGEX, fragmentHead);
    fragmentShader = fragmentShader.replace(FRAGMENT_BODY_REGEX, fragmentBody);

    shader.setSource(attachments.phong_vert, fragmentShader);

    for (let i = 0, keys = Object.keys(hasLight); i < keys.length; i += 1)
    {
        const key = keys[i];

        if (hasLight[key])
        {
            if (!shader.hasDefine("HAS_" + key.toUpperCase()))
            {
                shader.define("HAS_" + key.toUpperCase());
            }
        }
        else
        {
            if (shader.hasDefine("HAS_" + key.toUpperCase()))
            {
                shader.removeDefine("HAS_" + key.toUpperCase());
            }
        }
    }
}

shaderOut.setRef(shader);

let diffuseTextureUniform = null;
let specularTextureUniform = null;
let normalTextureUniform = null;
let aoTextureUniform = null;
let emissiveTextureUniform = null;
let emissiveMaskTextureUniform = null;
let emissiveMaskIntensityUniform = null;
let alphaTextureUniform = null;
let envTextureUniform = null;
let inEnvMapIntensityUni = null;
let inEnvMapWidthUni = null;
let luminanceTextureUniform = null;
let inLuminanceMaskIntensityUniform = null;

inColorizeTexture.onChange = function ()
{
    shader.toggleDefine("COLORIZE_TEXTURE", inColorizeTexture.get());
};

function updateDiffuseTexture()
{
    if (inDiffuseTexture.get())
    {
        if (!shader.hasDefine("HAS_TEXTURE_DIFFUSE"))
        {
            shader.define("HAS_TEXTURE_DIFFUSE");
            if (!diffuseTextureUniform) diffuseTextureUniform = new CGL.Uniform(shader, "t", "texDiffuse", 0);
        }
    }
    else
    {
        shader.removeUniform("texDiffuse");
        shader.removeDefine("HAS_TEXTURE_DIFFUSE");
        diffuseTextureUniform = null;
    }
}

function updateSpecularTexture()
{
    if (inSpecularTexture.get())
    {
        inSpecularIntensity.setUiAttribs({ "greyout": false });
        if (!shader.hasDefine("HAS_TEXTURE_SPECULAR"))
        {
            shader.define("HAS_TEXTURE_SPECULAR");
            if (!specularTextureUniform) specularTextureUniform = new CGL.Uniform(shader, "t", "texSpecular", 0);
        }
    }
    else
    {
        inSpecularIntensity.setUiAttribs({ "greyout": true });
        shader.removeUniform("texSpecular");
        shader.removeDefine("HAS_TEXTURE_SPECULAR");
        specularTextureUniform = null;
    }
}

function updateNormalTexture()
{
    if (inNormalTexture.get())
    {
        inNormalIntensity.setUiAttribs({ "greyout": false });

        if (!shader.hasDefine("HAS_TEXTURE_NORMAL"))
        {
            shader.define("HAS_TEXTURE_NORMAL");
            if (!normalTextureUniform) normalTextureUniform = new CGL.Uniform(shader, "t", "texNormal", 0);
        }
    }
    else
    {
        inNormalIntensity.setUiAttribs({ "greyout": true });

        shader.removeUniform("texNormal");
        shader.removeDefine("HAS_TEXTURE_NORMAL");
        normalTextureUniform = null;
    }
}

aoTextureUniform = new CGL.Uniform(shader, "t", "texAO");

function updateAoTexture()
{
    shader.toggleDefine("HAS_TEXTURE_AO", inAoTexture.get());

    inAoIntensity.setUiAttribs({ "greyout": !inAoTexture.get() });

    // if (inAoTexture.get())
    // {
    //     // inAoIntensity.setUiAttribs({ "greyout": false });

    //     // if (!shader.hasDefine("HAS_TEXTURE_AO"))
    //     // {
    //         // shader.define("HAS_TEXTURE_AO");
    //         // if (!aoTextureUniform)
    //         aoTextureUniform = new CGL.Uniform(shader, "t", "texAO", 0);
    //     // }
    // }
    // else
    // {
    //     // inAoIntensity.setUiAttribs({ "greyout": true });

    //     shader.removeUniform("texAO");
    //     // shader.removeDefine("HAS_TEXTURE_AO");
    //     aoTextureUniform = null;
    // }
}

function updateEmissiveTexture()
{
    if (inEmissiveTexture.get())
    {
        inEmissiveR.setUiAttribs({ "greyout": true });
        inEmissiveG.setUiAttribs({ "greyout": true });
        inEmissiveB.setUiAttribs({ "greyout": true });
        inEmissiveColorIntensity.setUiAttribs({ "greyout": true });

        if (inEmissiveActive.get())
        {
            inEmissiveIntensity.setUiAttribs({ "greyout": false });
        }

        if (!shader.hasDefine("HAS_TEXTURE_EMISSIVE"))
        {
            shader.define("HAS_TEXTURE_EMISSIVE");
            if (!emissiveTextureUniform) emissiveTextureUniform = new CGL.Uniform(shader, "t", "texEmissive", 0);
        }
    }
    else
    {
        inEmissiveIntensity.setUiAttribs({ "greyout": true });

        if (inEmissiveActive.get())
        {
            inEmissiveR.setUiAttribs({ "greyout": false });
            inEmissiveG.setUiAttribs({ "greyout": false });
            inEmissiveB.setUiAttribs({ "greyout": false });
            inEmissiveColorIntensity.setUiAttribs({ "greyout": false });
        }
        else
        {
            inEmissiveTexture.setUiAttribs({ "greyout": true });
        }

        shader.removeUniform("texEmissive");
        shader.removeDefine("HAS_TEXTURE_EMISSIVE");
        emissiveTextureUniform = null;
    }
}

function updateEmissiveMaskTexture()
{
    if (inEmissiveMaskTexture.get())
    { // we have a emissive texture
        if (inEmissiveActive.get())
        {
            inEmissiveMaskIntensity.setUiAttribs({ "greyout": false });
        }

        if (!shader.hasDefine("HAS_TEXTURE_EMISSIVE_MASK"))
        {
            shader.define("HAS_TEXTURE_EMISSIVE_MASK");
            if (!emissiveMaskTextureUniform) emissiveMaskTextureUniform = new CGL.Uniform(shader, "t", "texMaskEmissive", 0);
            if (!emissiveMaskIntensityUniform) emissiveMaskIntensityUniform = new CGL.Uniform(shader, "f", "inEmissiveMaskIntensity", inEmissiveMaskIntensity);
        }
    }
    else
    {
        if (!inEmissiveActive.get())
        {
            inEmissiveMaskTexture.setUiAttribs({ "greyout": true });
        }
        inEmissiveMaskIntensity.setUiAttribs({ "greyout": true });
        shader.removeUniform("texMaskEmissive");
        shader.removeUniform("inEmissiveMaskIntensity");
        shader.removeDefine("HAS_TEXTURE_EMISSIVE_MASK");
        emissiveMaskTextureUniform = null;
        emissiveMaskIntensityUniform = null;
    }
}

let updateEnvTextureLater = false;
function updateEnvTexture()
{
    shader.toggleDefine("HAS_TEXTURE_ENV", inEnvTexture.get());

    inEnvMapIntensity.setUiAttribs({ "greyout": !inEnvTexture.get() });

    if (inEnvTexture.get())
    {
        if (!envTextureUniform) envTextureUniform = new CGL.Uniform(shader, "t", "texEnv", 0);

        shader.toggleDefine("TEX_FORMAT_CUBEMAP", inEnvTexture.get().cubemap);

        if (inEnvTexture.get().cubemap)
        {
            shader.removeDefine("TEX_FORMAT_EQUIRECT");
            shader.removeDefine("ENVMAP_MATCAP");
            if (!inEnvMapIntensityUni)inEnvMapIntensityUni = new CGL.Uniform(shader, "f", "inEnvMapIntensity", inEnvMapIntensity);
            if (!inEnvMapWidthUni)inEnvMapWidthUni = new CGL.Uniform(shader, "f", "inEnvMapWidth", inEnvTexture.get().cubemap.width);
        }
        else
        {
            const isSquare = inEnvTexture.get().width === inEnvTexture.get().height;
            shader.toggleDefine("TEX_FORMAT_EQUIRECT", !isSquare);
            shader.toggleDefine("ENVMAP_MATCAP", isSquare);

            if (!inEnvMapIntensityUni)inEnvMapIntensityUni = new CGL.Uniform(shader, "f", "inEnvMapIntensity", inEnvMapIntensity);
            if (!inEnvMapWidthUni) inEnvMapWidthUni = new CGL.Uniform(shader, "f", "inEnvMapWidth", inEnvTexture.get().width);
        }
    }
    else
    {
        shader.removeUniform("inEnvMapIntensity");
        shader.removeUniform("inEnvMapWidth");
        shader.removeUniform("texEnv");
        shader.removeDefine("HAS_TEXTURE_ENV");
        shader.removeDefine("ENVMAP_MATCAP");
        envTextureUniform = null;
        inEnvMapIntensityUni = null;
    }

    updateEnvTextureLater = false;
}

function updateLuminanceMaskTexture()
{
    if (inLuminanceMaskTexture.get())
    {
        inLuminanceMaskIntensity.setUiAttribs({ "greyout": false });
        if (!luminanceTextureUniform)
        {
            shader.define("HAS_TEXTURE_LUMINANCE_MASK");
            luminanceTextureUniform = new CGL.Uniform(shader, "t", "texLuminance", 0);
            inLuminanceMaskIntensityUniform = new CGL.Uniform(shader, "f", "inLuminanceMaskIntensity", inLuminanceMaskIntensity);
        }
    }
    else
    {
        inLuminanceMaskIntensity.setUiAttribs({ "greyout": true });
        shader.removeDefine("HAS_TEXTURE_LUMINANCE_MASK");
        shader.removeUniform("inLuminanceMaskIntensity");
        shader.removeUniform("texLuminance");
        luminanceTextureUniform = null;
        inLuminanceMaskIntensityUniform = null;
    }
}

// TEX OPACITY

function updateDefines()
{
    shader.toggleDefine("ENV_BLEND_ADD", inEnvMapBlend.get() == "Add");
    shader.toggleDefine("ENV_BLEND_MUL", inEnvMapBlend.get() == "Multiply");
    shader.toggleDefine("ENV_BLEND_MIX", inEnvMapBlend.get() == "Mix");

    shader.toggleDefine("ALPHA_MASK_ALPHA", alphaMaskSource.get() == "A" || alphaMaskSource.get() == "Alpha");
    shader.toggleDefine("ALPHA_MASK_LUMI", alphaMaskSource.get() == "Luminance");
    shader.toggleDefine("ALPHA_MASK_R", alphaMaskSource.get() == "R");
    shader.toggleDefine("ALPHA_MASK_G", alphaMaskSource.get() == "G");
    shader.toggleDefine("ALPHA_MASK_B", alphaMaskSource.get() == "B");

    shader.toggleDefine("AO_CHAN_0", inAoChannel.get() == "1");
    shader.toggleDefine("AO_CHAN_1", inAoChannel.get() == "2");
}

function updateAlphaTexture()
{
    if (inAlphaTexture.get())
    {
        if (alphaTextureUniform !== null) return;
        shader.removeUniform("texAlpha");
        shader.define("HAS_TEXTURE_ALPHA");
        if (!alphaTextureUniform) alphaTextureUniform = new CGL.Uniform(shader, "t", "texAlpha", 0);

        alphaMaskSource.setUiAttribs({ "greyout": false });
        discardTransPxl.setUiAttribs({ "greyout": false });
    }
    else
    {
        shader.removeUniform("texAlpha");
        shader.removeDefine("HAS_TEXTURE_ALPHA");
        alphaTextureUniform = null;

        alphaMaskSource.setUiAttribs({ "greyout": true });
        discardTransPxl.setUiAttribs({ "greyout": true });
    }
    updateDefines();
}

discardTransPxl.onChange = function ()
{
    shader.toggleDefine("DISCARDTRANS", discardTransPxl.get());
};

inDiffuseTexture.onChange = updateDiffuseTexture;
inSpecularTexture.onChange = updateSpecularTexture;
inNormalTexture.onChange = updateNormalTexture;
inAoTexture.onChange = updateAoTexture;
inEmissiveTexture.onChange = updateEmissiveTexture;
inEmissiveMaskTexture.onChange = updateEmissiveMaskTexture;
inAlphaTexture.onChange = updateAlphaTexture;
inEnvTexture.onChange = () => { updateEnvTextureLater = true; };
inLuminanceMaskTexture.onChange = updateLuminanceMaskTexture;

const MAX_UNIFORM_FRAGMENTS = cgl.maxUniformsFrag;
const MAX_LIGHTS = MAX_UNIFORM_FRAGMENTS === 64 ? 6 : 16;

shader.define("MAX_LIGHTS", MAX_LIGHTS.toString());
shader.define("SPECULAR_PHONG");

inSpecularMode.onChange = function ()
{
    if (inSpecularMode.get() === "Phong")
    {
        shader.define("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_GAUSS");
        shader.removeDefine("SPECULAR_SCHLICK");
    }
    else if (inSpecularMode.get() === "Blinn")
    {
        shader.define("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_GAUSS");
        shader.removeDefine("SPECULAR_SCHLICK");
    }
    else if (inSpecularMode.get() === "Gauss")
    {
        shader.define("SPECULAR_GAUSS");
        shader.removeDefine("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_SCHLICK");
    }
    else if (inSpecularMode.get() === "Schlick")
    {
        shader.define("SPECULAR_SCHLICK");
        shader.removeDefine("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_GAUSS");
    }
};

inEnergyConservation.onChange = function ()
{
    shader.toggleDefine("CONSERVE_ENERGY", inEnergyConservation.get());
};

inToggleDoubleSided.onChange = function ()
{
    shader.toggleDefine("DOUBLE_SIDED", inToggleDoubleSided.get());
};

// * INIT UNIFORMS *

const uniMaterialProps = new CGL.Uniform(shader, "4f", "inMaterialProperties", inAlbedo, inRoughness, inShininess, inSpecularCoefficient);
const uniDiffuseColor = new CGL.Uniform(shader, "4f", "inDiffuseColor", inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA);
const uniTextureIntensities = new CGL.Uniform(shader, "4f", "inTextureIntensities", inNormalIntensity, inAoIntensity, inSpecularIntensity, inEmissiveIntensity);
const uniTextureRepeatOffset = new CGL.Uniform(shader, "4f", "inTextureRepeatOffset", inDiffuseRepeatX, inDiffuseRepeatY, inTextureOffsetX, inTextureOffsetY);

shader.uniformColorDiffuse = uniDiffuseColor;

const lightUniforms = [];
let oldCount = 0;

function createUniforms(lightsCount)
{
    for (let i = 0; i < lightUniforms.length; i += 1)
    {
        lightUniforms[i] = null;
    }

    for (let i = 0; i < lightsCount; i += 1)
    {
        lightUniforms[i] = null;
        if (!lightUniforms[i])
        {
            lightUniforms[i] = {
                "color": new CGL.Uniform(shader, "3f", "phongLight" + i + ".color", [1, 1, 1]),
                "position": new CGL.Uniform(shader, "3f", "phongLight" + i + ".position", [0, 11, 0]),
                "specular": new CGL.Uniform(shader, "3f", "phongLight" + i + ".specular", [1, 1, 1]),
                // intensity, attenuation, falloff, radius
                "lightProperties": new CGL.Uniform(shader, "4f", "phongLight" + i + ".lightProperties", [1, 1, 1, 1]),

                "conePointAt": new CGL.Uniform(shader, "3f", "phongLight" + i + ".conePointAt", vec3.create()),
                "spotProperties": new CGL.Uniform(shader, "3f", "phongLight" + i + ".spotProperties", [0, 0, 0, 0]),
                "castLight": new CGL.Uniform(shader, "i", "phongLight" + i + ".castLight", 1),

            };
        }
    }
}

function setDefaultUniform(light)
{
    defaultUniform.position.setValue(light.position);
    defaultUniform.color.setValue(light.color);
    defaultUniform.specular.setValue(light.specular);
    defaultUniform.lightProperties.setValue([
        light.intensity,
        light.attenuation,
        light.falloff,
        light.radius,
    ]);

    defaultUniform.conePointAt.setValue(light.conePointAt);
    defaultUniform.spotProperties.setValue([
        light.cosConeAngle,
        light.cosConeAngleInner,
        light.spotExponent,
    ]);
}

function setUniforms(lightStack)
{
    for (let i = 0; i < lightStack.length; i += 1)
    {
        const light = lightStack[i];
        light.isUsed = true;

        lightUniforms[i].position.setValue(light.position);
        lightUniforms[i].color.setValue(light.color);
        lightUniforms[i].specular.setValue(light.specular);

        lightUniforms[i].lightProperties.setValue([
            light.intensity,
            light.attenuation,
            light.falloff,
            light.radius,
        ]);

        lightUniforms[i].conePointAt.setValue(light.conePointAt);
        lightUniforms[i].spotProperties.setValue([
            light.cosConeAngle,
            light.cosConeAngleInner,
            light.spotExponent,
        ]);

        lightUniforms[i].castLight.setValue(light.castLight);
    }
}

function compareLights(lightStack)
{
    if (lightStack.length !== oldCount)
    {
        createShader(lightStack);
        createUniforms(lightStack.length);
        oldCount = lightStack.length;
        setUniforms(lightStack);
        // recompileShader = false;
    }
    else
    {
        // if (recompileShader)
        // {
        //     createShader(lightStack);
        //     createUniforms(lightStack.length);
        //     recompileShader = false;
        // }
        setUniforms(lightStack);
    }
}

let defaultUniform = null;

function createDefaultUniform()
{
    defaultUniform = {
        "color": new CGL.Uniform(shader, "3f", "phongLight" + 0 + ".color", [1, 1, 1]),
        "specular": new CGL.Uniform(shader, "3f", "phongLight" + 0 + ".specular", [1, 1, 1]),
        "position": new CGL.Uniform(shader, "3f", "phongLight" + 0 + ".position", [0, 11, 0]),
        // intensity, attenuation, falloff, radius
        "lightProperties": new CGL.Uniform(shader, "4f", "phongLight" + 0 + ".lightProperties", [1, 1, 1, 1]),
        "conePointAt": new CGL.Uniform(shader, "3f", "phongLight" + 0 + ".conePointAt", vec3.create()),
        "spotProperties": new CGL.Uniform(shader, "3f", "phongLight" + 0 + ".spotProperties", [0, 0, 0, 0]),
        "castLight": new CGL.Uniform(shader, "i", "phongLight" + 0 + ".castLight", 1),
    };
}

const DEFAULT_LIGHTSTACK = [{
    "type": "point",
    "position": [5, 5, 5],
    "color": [1, 1, 1],
    "specular": [1, 1, 1],
    "intensity": 1,
    "attenuation": 0,
    "falloff": 0.5,
    "radius": 80,
    "castLight": 1,
}];

const iViewMatrix = mat4.create();

function updateLights()
{
    if (cgl.tempData.lightStack)
    {
        if (cgl.tempData.lightStack.length === 0)
        {
            op.setUiError("deflight", "Default light is enabled. Please add lights to your patch to make this warning disappear.", 1);
        }
        else op.setUiError("deflight", null);
    }

    if ((!cgl.tempData.lightStack || !cgl.tempData.lightStack.length))
    {
        // if no light in light stack, use default light & set count to -1
        // so when a new light gets added, the shader does recompile
        if (!defaultUniform)
        {
            createDefaultShader();
            createDefaultUniform();
        }

        mat4.invert(iViewMatrix, cgl.vMatrix);
        // set default light position to camera position
        DEFAULT_LIGHTSTACK[0].position = [iViewMatrix[12], iViewMatrix[13], iViewMatrix[14]];
        setDefaultUniform(DEFAULT_LIGHTSTACK[0]);

        oldCount = -1;
    }
    else
    {
        if (shader)
        {
            if (cgl.tempData.lightStack)
            {
                if (cgl.tempData.lightStack.length)
                {
                    defaultUniform = null;
                    compareLights(cgl.tempData.lightStack);
                }
            }
        }
    }
}

const render = function ()
{
    if (!shader)
    {
        op.log("NO SHADER");
        return;
    }

    cgl.pushShader(shader);
    shader.popTextures();

    outTrigger.trigger();
    cgl.popShader();
};

op.preRender = function ()
{
    shader.bind();
    render();
};

/* transform for default light */
const inverseViewMat = mat4.create();
const vecTemp = vec3.create();
const camPos = vec3.create();

inTrigger.onTriggered = function ()
{
    if (!shader)
    {
        op.log("phong has no shader...");
        return;
    }

    if (updateEnvTextureLater)updateEnvTexture();

    cgl.pushShader(shader);

    shader.popTextures();

    if (inDiffuseTexture.get()) shader.pushTexture(diffuseTextureUniform, inDiffuseTexture.get());
    if (inSpecularTexture.get()) shader.pushTexture(specularTextureUniform, inSpecularTexture.get());
    if (inNormalTexture.get()) shader.pushTexture(normalTextureUniform, inNormalTexture.get());
    if (inAoTexture.get()) shader.pushTexture(aoTextureUniform, inAoTexture.get());
    if (inEmissiveTexture.get()) shader.pushTexture(emissiveTextureUniform, inEmissiveTexture.get());
    if (inEmissiveMaskTexture.get()) shader.pushTexture(emissiveMaskTextureUniform, inEmissiveMaskTexture.get());
    if (inAlphaTexture.get()) shader.pushTexture(alphaTextureUniform, inAlphaTexture.get());
    if (inEnvTexture.get())
    {
        if (inEnvTexture.get().cubemap) shader.pushTexture(envTextureUniform, inEnvTexture.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        else shader.pushTexture(envTextureUniform, inEnvTexture.get());
    }

    if (inLuminanceMaskTexture.get())
    {
        shader.pushTexture(luminanceTextureUniform, inLuminanceMaskTexture.get());
    }

    updateLights();

    outTrigger.trigger();

    cgl.popShader();
};

if (cgl.glVersion == 1)
{
    if (!cgl.enableExtension("EXT_shader_texture_lod"))
    {
        op.log("no EXT_shader_texture_lod texture extension");
        // throw "no EXT_shader_texture_lod texture extension";
    }
    else
    {
        shader.enableExtension("GL_EXT_shader_texture_lod");
        cgl.enableExtension("OES_texture_float");
        cgl.enableExtension("OES_texture_float_linear");
        cgl.enableExtension("OES_texture_half_float");
        cgl.enableExtension("OES_texture_half_float_linear");

        shader.enableExtension("GL_OES_standard_derivatives");
        shader.enableExtension("GL_OES_texture_float");
        shader.enableExtension("GL_OES_texture_float_linear");
        shader.enableExtension("GL_OES_texture_half_float");
        shader.enableExtension("GL_OES_texture_half_float_linear");
    }
}

updateDiffuseTexture();
updateSpecularTexture();
updateNormalTexture();
updateAoTexture();
updateAlphaTexture();
updateEmissiveTexture();
updateEmissiveMaskTexture();
updateEnvTexture();
updateLuminanceMaskTexture();
