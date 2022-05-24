// utility
const cgl = op.patch.cgl;
// inputs
const inTrigger = op.inTrigger("render");
inTrigger.onTriggered = doRender;

const inDiffuseR = op.inFloat("R", Math.random());
const inDiffuseG = op.inFloat("G", Math.random());
const inDiffuseB = op.inFloat("B", Math.random());
const inDiffuseA = op.inFloatSlider("A", 1);
const diffuseColors = [inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA];
op.setPortGroup("Diffuse Color", diffuseColors);

const inRoughness = op.inFloatSlider("Roughness", 0.5);
const inMetalness = op.inFloatSlider("Metalness", 0.0);
const inAlphaMode = op.inSwitch("Alpha Mode", ["Opaque", "Masked", "Dithered", "Blend"], "Blend");

const inTonemapping = op.inSwitch("Tonemapping", ["sRGB", "HejiDawson", "Photographic"], "sRGB");
const inTonemappingExposure = op.inFloat("Exposure", 1.0);

const inToggleGR = op.inBool("Disable geometric roughness", false);
const inToggleNMGR = op.inBool("Use roughness from normal map", false);
const inUseVertexColours = op.inValueBool("Use Vertex Colours", false);
const inVertexColourMode = op.inSwitch("Vertex Colour Mode", ["colour", "AORM", "AO", "R", "M", "lightmap"], "colour");
const inHeightDepth = op.inFloat("Height Intensity", 1.0);
const inUseOptimizedHeight = op.inValueBool("Faster heightmapping", false);
const inUseClearCoat = op.inValueBool("Use Clear Coat", false);
const inClearCoatRoughness = op.inFloatSlider("Clear Coat Roughness", 0.5);

// texture inputs
const inTexIBLLUT = op.inTexture("IBL LUT");
const inTexIrradiance = op.inTexture("Diffuse Irradiance");
const inTexPrefiltered = op.inTexture("Pre-filtered envmap");
const inMipLevels = op.inInt("Num mip levels");

const inTexAlbedo = op.inTexture("Albedo");
const inTexAORM = op.inTexture("AORM");
const inTexNormal = op.inTexture("Normal map");
const inTexHeight = op.inTexture("Height");
const inLightmap = op.inTexture("Lightmap");
const inDiffuseIntensity = op.inFloat("Diffuse Intensity", 1.0);
const inSpecularIntensity = op.inFloat("Specular Intensity", 1.0);
const inLightmapRGBE = op.inBool("Lightmap is RGBE", false);
const inLightmapIntensity = op.inFloat("Lightmap Intensity", 1.0);

// outputs
const outTrigger = op.outTrigger("Next");
const shaderOut = op.outObject("Shader");
shaderOut.ignoreValueSerialize = true;
// UI stuff
op.toWorkPortsNeedToBeLinked(inTrigger);

inDiffuseR.setUiAttribs({ "colorPick": true });
op.setPortGroup("Shader Parameters", [inRoughness, inMetalness, inAlphaMode]);
op.setPortGroup("Advanced Shader Parameters", [inToggleGR, inToggleNMGR, inUseVertexColours, inVertexColourMode, inHeightDepth, inUseOptimizedHeight, inUseClearCoat, inClearCoatRoughness]);
op.setPortGroup("Textures", [inTexAlbedo, inTexAORM, inTexNormal, inTexHeight, inLightmap]);
op.setPortGroup("Lighting", [inDiffuseIntensity, inSpecularIntensity, inLightmapIntensity, inLightmapRGBE, inTexIBLLUT, inTexIrradiance, inTexPrefiltered, inMipLevels]);
op.setPortGroup("Tonemapping", [inTonemapping, inTonemappingExposure]);
// globals
const PBRShader = new CGL.Shader(cgl, "PBRShader");
PBRShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
// light sources (except IBL)
let PBRLightStack = {};
const lightUniforms = [];
const LIGHT_INDEX_REGEX = new RegExp("{{LIGHT_INDEX}}", "g");
const FRAGMENT_HEAD_REGEX = new RegExp("{{PBR_FRAGMENT_HEAD}}", "g");
const FRAGMENT_BODY_REGEX = new RegExp("{{PBR_FRAGMENT_BODY}}", "g");
const lightFragmentHead = attachments.light_head_frag;
const lightFragmentBodies = {
    "point": attachments.light_body_point_frag,
    "directional": attachments.light_body_directional_frag,
    "spot": attachments.light_body_spot_frag,
};
const createLightFragmentHead = (n) => lightFragmentHead.replace("{{LIGHT_INDEX}}", n);
const createLightFragmentBody = (n, type) => lightFragmentBodies[type].replace(LIGHT_INDEX_REGEX, n);
let currentLightCount = -1;

if (cgl.glVersion == 1)
{
    if (!cgl.gl.getExtension("EXT_shader_texture_lod"))
    {
        op.log("no EXT_shader_texture_lod texture extension");
        throw "no EXT_shader_texture_lod texture extension";
    }
    else
    {
        PBRShader.enableExtension("GL_EXT_shader_texture_lod");
        cgl.gl.getExtension("OES_texture_float");
        cgl.gl.getExtension("OES_texture_float_linear");
        cgl.gl.getExtension("OES_texture_half_float");
        cgl.gl.getExtension("OES_texture_half_float_linear");

        PBRShader.enableExtension("GL_OES_standard_derivatives");
        PBRShader.enableExtension("GL_OES_texture_float");
        PBRShader.enableExtension("GL_OES_texture_float_linear");
        PBRShader.enableExtension("GL_OES_texture_half_float");
        PBRShader.enableExtension("GL_OES_texture_half_float_linear");
    }
}

buildShader();
// uniforms
const inAlbedoUniform = new CGL.Uniform(PBRShader, "t", "_AlbedoMap", 0);
const inAORMUniform = new CGL.Uniform(PBRShader, "t", "_AORMMap", 0);
const inNormalUniform = new CGL.Uniform(PBRShader, "t", "_NormalMap", 0);
const inIBLLUTUniform = new CGL.Uniform(PBRShader, "t", "IBL_BRDF_LUT", 0);
const inIrradianceUniform = new CGL.Uniform(PBRShader, "tc", "_irradiance", 1);
const inPrefilteredUniform = new CGL.Uniform(PBRShader, "tc", "_prefilteredEnvironmentColour", 1);
const inMipLevelsUniform = new CGL.Uniform(PBRShader, "f", "MAX_REFLECTION_LOD", 0);
const inTonemappingExposureUniform = new CGL.Uniform(PBRShader, "f", "tonemappingExposure", 1.0);
const inDiffuseIntensityUniform = new CGL.Uniform(PBRShader, "f", "diffuseIntensity", 1.0);
const inSpecularIntensityUniform = new CGL.Uniform(PBRShader, "f", "specularIntensity", 1.0);
const inHeightUniform = new CGL.Uniform(PBRShader, "t", "_HeightMap", 0);
const inLightmapUniform = new CGL.Uniform(PBRShader, "t", "_Lightmap", 0);
const inLightmapIntensityUniform = new CGL.Uniform(PBRShader, "f", "lightmapIntensity", 1.0);

const inDiffuseColor = new CGL.Uniform(PBRShader, "4f", "_Albedo", inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA);
const inRoughnessUniform = new CGL.Uniform(PBRShader, "f", "_Roughness", 0.5);
const inMetalnessUniform = new CGL.Uniform(PBRShader, "f", "_Metalness", 0);
const inHeightDepthUniform = new CGL.Uniform(PBRShader, "f", "_HeightDepth", 1.0);
const inClearCoatRoughnessUniform = new CGL.Uniform(PBRShader, "f", "_ClearCoatRoughness", 0.5);

const inPCOrigin = new CGL.Uniform(PBRShader, "3f", "_PCOrigin", [0, 0, 0]);
const inPCboxMin = new CGL.Uniform(PBRShader, "3f", "_PCboxMin", [-1, -1, -1]);
const inPCboxMax = new CGL.Uniform(PBRShader, "3f", "_PCboxMax", [1, 1, 1]);

PBRShader.uniformColorDiffuse = inDiffuseColor;
PBRShader.uniformPbrMetalness = inMetalnessUniform;
PBRShader.uniformPbrRoughness = inRoughnessUniform;

inTexPrefiltered.onChange = updateIBLTexDefines;

inLightmapRGBE.onChange = () =>
{
    PBRShader.toggleDefine("LIGHTMAP_IS_RGBE", inLightmapRGBE.get());
};
inUseVertexColours.onChange = () =>
{
    PBRShader.toggleDefine("VERTEX_COLORS", inUseVertexColours.get());

    if (!inUseVertexColours.get())
    {
        PBRShader.toggleDefine("USE_LIGHTMAP", inLightmap.get());
    }
    else
    {
        if (inVertexColourMode.get() === "lightmap")
        {
            PBRShader.define("USE_LIGHTMAP");
        }
    }
};
inUseClearCoat.onChange = () =>
{
    PBRShader.toggleDefine("USE_CLEAR_COAT", inUseClearCoat.get());
};
inVertexColourMode.onChange = function ()
{
    if (inVertexColourMode.get() === "colour")
    {
        PBRShader.define("VCOL_COLOUR");
        PBRShader.removeDefine("VCOL_AORM");
        PBRShader.removeDefine("VCOL_AO");
        PBRShader.removeDefine("VCOL_R");
        PBRShader.removeDefine("VCOL_M");
        PBRShader.removeDefine("VCOL_LIGHTMAP");
        PBRShader.toggleDefine("USE_LIGHTMAP", inLightmap.get());
    }
    else if (inVertexColourMode.get() === "AORM")
    {
        PBRShader.define("VCOL_AORM");
        PBRShader.removeDefine("VCOL_COLOUR");
        PBRShader.removeDefine("VCOL_AO");
        PBRShader.removeDefine("VCOL_R");
        PBRShader.removeDefine("VCOL_M");
        PBRShader.removeDefine("VCOL_LIGHTMAP");
        PBRShader.toggleDefine("USE_LIGHTMAP", inLightmap.get());
    }
    else if (inVertexColourMode.get() === "AO")
    {
        PBRShader.define("VCOL_AO");
        PBRShader.removeDefine("VCOL_AORM");
        PBRShader.removeDefine("VCOL_COLOUR");
        PBRShader.removeDefine("VCOL_R");
        PBRShader.removeDefine("VCOL_M");
        PBRShader.removeDefine("VCOL_LIGHTMAP");
        PBRShader.toggleDefine("USE_LIGHTMAP", inLightmap.get());
    }
    else if (inVertexColourMode.get() === "R")
    {
        PBRShader.define("VCOL_R");
        PBRShader.removeDefine("VCOL_AORM");
        PBRShader.removeDefine("VCOL_AO");
        PBRShader.removeDefine("VCOL_COLOUR");
        PBRShader.removeDefine("VCOL_M");
        PBRShader.removeDefine("VCOL_LIGHTMAP");
        PBRShader.toggleDefine("USE_LIGHTMAP", inLightmap.get());
    }
    else if (inVertexColourMode.get() === "M")
    {
        PBRShader.define("VCOL_M");
        PBRShader.removeDefine("VCOL_AORM");
        PBRShader.removeDefine("VCOL_AO");
        PBRShader.removeDefine("VCOL_R");
        PBRShader.removeDefine("VCOL_COLOUR");
        PBRShader.removeDefine("VCOL_LIGHTMAP");
        PBRShader.toggleDefine("USE_LIGHTMAP", inLightmap.get());
    }
    else if (inVertexColourMode.get() === "lightmap")
    {
        PBRShader.define("VCOL_LIGHTMAP");
        PBRShader.removeDefine("VCOL_AORM");
        PBRShader.removeDefine("VCOL_AO");
        PBRShader.removeDefine("VCOL_R");
        PBRShader.removeDefine("VCOL_COLOUR");
        PBRShader.removeDefine("VCOL_M");

        PBRShader.define("USE_LIGHTMAP");
    }
};

inTexAlbedo.onChange = () =>
{
    let albedoBool = inTexAlbedo.get();
    PBRShader.toggleDefine("USE_ALBEDO_TEX", albedoBool);

    inDiffuseR.setUiAttribs({ "greyout": albedoBool });
    inDiffuseG.setUiAttribs({ "greyout": albedoBool });
    inDiffuseB.setUiAttribs({ "greyout": albedoBool });
    inDiffuseA.setUiAttribs({ "greyout": albedoBool });
};
inTexAORM.onChange = () =>
{
    let AORMBool = inTexAORM.get();
    PBRShader.toggleDefine("USE_AORM_TEX", AORMBool);

    inRoughness.setUiAttribs({ "greyout": AORMBool });
    inMetalness.setUiAttribs({ "greyout": AORMBool });
};
inTexNormal.onChange = () =>
{
    PBRShader.toggleDefine("USE_NORMAL_TEX", inTexNormal.get());
};
inTexHeight.onChange = () =>
{
    PBRShader.toggleDefine("USE_HEIGHT_TEX", inTexHeight.get());
};
inToggleNMGR.onChange = () =>
{
    PBRShader.toggleDefine("DONT_USE_NMGR", inToggleNMGR.get());
};
inToggleGR.onChange = () =>
{
    PBRShader.toggleDefine("DONT_USE_GR", inToggleGR.get());
};
inLightmap.onChange = () =>
{
    if (!inUseVertexColours.get())
    {
        PBRShader.toggleDefine("USE_LIGHTMAP", inLightmap.get());
    }
    else
    {
        if (inVertexColourMode.get() === "lightmap")
        {
            PBRShader.define("USE_LIGHTMAP");
        }
    }
};
inUseOptimizedHeight.onChange = () =>
{
    PBRShader.toggleDefine("USE_OPTIMIZED_HEIGHT", inUseOptimizedHeight.get());
};
inAlphaMode.onChange = function ()
{
    if (inAlphaMode.get() === "Opaque")
    {
        PBRShader.removeDefine("ALPHA_MASKED");
        PBRShader.removeDefine("ALPHA_DITHERED");
        PBRShader.removeDefine("ALPHA_BLEND");
    }
    else if (inAlphaMode.get() === "Masked")
    {
        PBRShader.define("ALPHA_MASKED");
        PBRShader.removeDefine("ALPHA_DITHERED");
        PBRShader.removeDefine("ALPHA_BLEND");
    }
    else if (inAlphaMode.get() === "Dithered")
    {
        PBRShader.define("ALPHA_DITHERED");
        PBRShader.removeDefine("ALPHA_BLEND");
        PBRShader.removeDefine("ALPHA_MASKED");
    }
    else if (inAlphaMode.get() === "Blend")
    {
        PBRShader.define("ALPHA_BLEND");
        PBRShader.removeDefine("ALPHA_DITHERED");
        PBRShader.removeDefine("ALPHA_MASKED");
    }
};
inAlphaMode.onChange();
inUseVertexColours.onChange();
inVertexColourMode.onChange();

inTonemapping.onChange = function ()
{
    if (inTonemapping.get() === "sRGB")
    {
        PBRShader.define("TONEMAP_sRGB");
        PBRShader.removeDefine("TONEMAP_HejiDawson");
        PBRShader.removeDefine("TONEMAP_Photographic");
    }
    else if (inTonemapping.get() === "HejiDawson")
    {
        PBRShader.define("TONEMAP_HejiDawson");
        PBRShader.removeDefine("TONEMAP_sRGB");
        PBRShader.removeDefine("TONEMAP_Photographic");
    }
    else if (inTonemapping.get() === "Photographic")
    {
        PBRShader.define("TONEMAP_Photographic");
        PBRShader.removeDefine("TONEMAP_HejiDawson");
        PBRShader.removeDefine("TONEMAP_sRGB");
    }
};
function setEnvironmentLighting(enabled)
{
    if (enabled)
    {
        PBRShader.define("USE_ENVIRONMENT_LIGHTING");
    }
    else
    {
        PBRShader.removeDefine("USE_ENVIRONMENT_LIGHTING");
    }
}

op.preRender = function ()
{
    PBRShader.bind();
    doRender();
};

function updateIBLTexDefines()
{
    inMipLevels.setUiAttribs({ "greyout": !inTexPrefiltered.get() });
}

function updateLightUniforms()
{
    for (let i = 0; i < PBRLightStack.length; i += 1)
    {
        const light = PBRLightStack[i];
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

function buildShader()
{
    const vertexShader = attachments.BasicPBR_vert;
    const lightIncludes = attachments.light_includes_frag;
    let fragmentShader = attachments.BasicPBR_frag;

    let fragmentHead = "";
    let fragmentBody = "";

    if (PBRLightStack.length > 0)
    {
        fragmentHead = fragmentHead.concat(lightIncludes);
    }

    for (let i = 0; i < PBRLightStack.length; i += 1)
    {
        const light = PBRLightStack[i];
        const type = light.type;

        fragmentHead = fragmentHead.concat(createLightFragmentHead(i));
        fragmentBody = fragmentBody.concat(createLightFragmentBody(i, light.type));
    }

    fragmentShader = fragmentShader.replace(FRAGMENT_HEAD_REGEX, fragmentHead);
    fragmentShader = fragmentShader.replace(FRAGMENT_BODY_REGEX, fragmentBody);

    PBRShader.setSource(vertexShader, fragmentShader);
    shaderOut.set(PBRShader);

    for (let i = 0; i < PBRLightStack.length; i += 1)
    {
        lightUniforms[i] = null;
        if (!lightUniforms[i])
        {
            lightUniforms[i] = {
                "color": new CGL.Uniform(PBRShader, "3f", "lightOP" + i + ".color", [1, 1, 1]),
                "position": new CGL.Uniform(PBRShader, "3f", "lightOP" + i + ".position", [0, 11, 0]),
                "specular": new CGL.Uniform(PBRShader, "3f", "lightOP" + i + ".specular", [1, 1, 1]),
                "lightProperties": new CGL.Uniform(PBRShader, "4f", "lightOP" + i + ".lightProperties", [1, 1, 1, 1]),

                "conePointAt": new CGL.Uniform(PBRShader, "3f", "lightOP" + i + ".conePointAt", vec3.create()),
                "spotProperties": new CGL.Uniform(PBRShader, "3f", "lightOP" + i + ".spotProperties", [0, 0, 0, 0]),
                "castLight": new CGL.Uniform(PBRShader, "i", "lightOP" + i + ".castLight", 1),

            };
        }
    }
}

function updateLights()
{
    if (cgl.frameStore.lightStack && currentLightCount !== cgl.frameStore.lightStack.length)
    {
        PBRLightStack = cgl.frameStore.lightStack;
        buildShader();

        currentLightCount = cgl.frameStore.lightStack.length;
    }
}

function doRender()
{
    cgl.pushShader(PBRShader);

    PBRShader.popTextures();

    if (cgl.frameStore.pbrEnvStack && cgl.frameStore.pbrEnvStack.length > 0 &&
        cgl.frameStore.pbrEnvStack[cgl.frameStore.pbrEnvStack.length - 1].texIBLLUT.tex && cgl.frameStore.pbrEnvStack[cgl.frameStore.pbrEnvStack.length - 1].texDiffIrr.tex && cgl.frameStore.pbrEnvStack[cgl.frameStore.pbrEnvStack.length - 1].texPreFiltered.tex)
    {
        const pbrEnv = cgl.frameStore.pbrEnvStack[cgl.frameStore.pbrEnvStack.length - 1];

        PBRShader.pushTexture(inIBLLUTUniform, pbrEnv.texIBLLUT.tex);
        PBRShader.pushTexture(inIrradianceUniform, pbrEnv.texDiffIrr.tex, cgl.gl.TEXTURE_CUBE_MAP);
        PBRShader.pushTexture(inPrefilteredUniform, pbrEnv.texPreFiltered.tex, cgl.gl.TEXTURE_CUBE_MAP);
        inMipLevelsUniform.setValue(pbrEnv.texPreFilteredMipLevels || 7);

        PBRShader.toggleDefine("USE_PARALLAX_CORRECTION", pbrEnv.UseParallaxCorrection);
        if (pbrEnv.UseParallaxCorrection)
        {
            inPCOrigin.setValue(pbrEnv.PCOrigin);
            inPCboxMin.setValue(pbrEnv.PCboxMin);
            inPCboxMax.setValue(pbrEnv.PCboxMax);
        }

        setEnvironmentLighting(true);
    }
    else
    {
        setEnvironmentLighting(false);
    }

    if (inTexIBLLUT.get())
    {
        setEnvironmentLighting(true);
        PBRShader.pushTexture(inIBLLUTUniform, inTexIBLLUT.get().tex);
        inMipLevelsUniform.setValue(inMipLevels.get());
        if (inTexIrradiance.get()) PBRShader.pushTexture(inIrradianceUniform, inTexIrradiance.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        if (inTexPrefiltered.get()) PBRShader.pushTexture(inPrefilteredUniform, inTexPrefiltered.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
    }

    if (inTexAlbedo.get()) PBRShader.pushTexture(inAlbedoUniform, inTexAlbedo.get().tex);
    if (inTexAORM.get()) PBRShader.pushTexture(inAORMUniform, inTexAORM.get().tex);
    if (inTexNormal.get()) PBRShader.pushTexture(inNormalUniform, inTexNormal.get().tex);
    if (inTexHeight.get()) PBRShader.pushTexture(inHeightUniform, inTexHeight.get().tex);
    if (inLightmap.get())
    {
        PBRShader.pushTexture(inLightmapUniform, inLightmap.get().tex);
        inLightmapIntensityUniform.setValue(inLightmapIntensity.get());
    }
    if (inUseVertexColours.get())
    {
        if (inVertexColourMode.get() === "lightmap")
        {
            inLightmapIntensityUniform.setValue(inLightmapIntensity.get());
        }
    }

    if (!inTexAORM.get())
    {
        inRoughnessUniform.setValue(inRoughness.get());
        inMetalnessUniform.setValue(inMetalness.get());
    }
    if (inTexHeight.get())
    {
        inHeightDepthUniform.setValue(inHeightDepth.get());
    }
    if (inUseClearCoat.get())
    {
        inClearCoatRoughnessUniform.setValue(inClearCoatRoughness.get());
    }
    if (inTonemappingExposure.get()) inTonemappingExposureUniform.setValue(inTonemappingExposure.get());
    if (inDiffuseIntensity.get()) inDiffuseIntensityUniform.setValue(inDiffuseIntensity.get());
    if (inSpecularIntensity.get()) inSpecularIntensityUniform.setValue(inSpecularIntensity.get());

    updateLights();
    updateLightUniforms();

    outTrigger.trigger();
    cgl.popShader();
}
