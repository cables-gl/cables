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
const inMetalness = op.inFloatSlider("Metalness", 1.0);
const inToggleGS = op.inBool("Use mesh tangents/binormals", false);
const inToggleGR = op.inBool("Disable geometric roughness", false);
const inAlphaMode = op.inSwitch("Alpha Mode", ["Opaque", "Masked", "Dithered", "Blend"], "Blend");

// texture inputs
const inTexIBLLUT = op.inTexture("IBL LUT");
const inTexIrradiance = op.inTexture("Diffuse Irradiance");
const inTexPrefiltered = op.inTexture("Pre-filtered envmap");
const inMipLevels = op.inInt("Num mip levels");
// const inTexIBLLUT = op.inTexture("IBL LUT");
// const inTexIrradiance = op.inTexture("cubemap (diffuse irradiance)");
// const inTexPrefiltered = op.inTexture("cubemap (pre-filtered environment map)");
// const inMipLevels = op.inInt("Number of Pre-filtered mip levels");

const inTexAlbedo = op.inTexture("Albedo");
const inTexAORM = op.inTexture("AORM");
const inTexNormal = op.inTexture("Normal map");

// const inTexAlbedo = op.inTexture("Albedo (sRGB)");
// const inTexAORM = op.inTexture("AORM (linear rec.709, R: ambient occlusion, G: roughness, B: metalness)");
// const inTexNormal = op.inTexture("Normal map (linear rec.709, +Y, TS per vertex)");

// const inTonemappingExposure = op.inFloat("Tonemapping Exposure", 2.0);
const inDiffuseIntensity = op.inFloat("Diffuse Intensity", 1.0);
const inSpecularIntensity = op.inFloat("Specular Intensity", 1.0);

// outputs
const outTrigger = op.outTrigger("Next");
const shaderOut = op.outObject("Shader");
shaderOut.ignoreValueSerialize = true;
// UI stuff
op.toWorkPortsNeedToBeLinked(inTrigger);
op.toWorkPortsNeedToBeLinked(inTexIrradiance);
op.toWorkPortsNeedToBeLinked(inTexPrefiltered);
op.toWorkPortsNeedToBeLinked(inTexIBLLUT);
op.toWorkPortsNeedToBeLinked(inMipLevels);

inDiffuseR.setUiAttribs({ "colorPick": true });
op.setPortGroup("Shader Parameters", [inRoughness, inMetalness, inAlphaMode, inToggleGS, inToggleGR]);
op.setPortGroup("Textures", [inTexAlbedo, inTexAORM, inTexNormal]);
op.setPortGroup("Lighting", [inDiffuseIntensity, inSpecularIntensity, inTexIBLLUT, inTexIrradiance, inTexPrefiltered, inMipLevels]);
// globals
const PBRShader = new CGL.Shader(cgl, "PBRShader");
PBRShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

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

PBRShader.setSource(attachments.BasicPBR_vert, attachments.BasicPBR_frag);
shaderOut.set(PBRShader);
// uniforms
const inAlbedoUniform = new CGL.Uniform(PBRShader, "t", "_AlbedoMap", 0);
const inAORMUniform = new CGL.Uniform(PBRShader, "t", "_AORMMap", 0);
const inNormalUniform = new CGL.Uniform(PBRShader, "t", "_NormalMap", 0);
const inIBLLUTUniform = new CGL.Uniform(PBRShader, "t", "IBL_BRDF_LUT", 0);
const inIrradianceUniform = new CGL.Uniform(PBRShader, "tc", "_irradiance", 1);
const inPrefilteredUniform = new CGL.Uniform(PBRShader, "tc", "_prefilteredEnvironmentColour", 1);
const inMipLevelsUniform = new CGL.Uniform(PBRShader, "f", "MAX_REFLECTION_LOD", 0);
// let inTonemappingExposureUniform = new CGL.Uniform(PBRShader, "f", "tonemappingExposure", 2.0);
const inDiffuseIntensityUniform = new CGL.Uniform(PBRShader, "f", "diffuseIntensity", 1.0);
const inSpecularIntensityUniform = new CGL.Uniform(PBRShader, "f", "specularIntensity", 1.0);

const inDiffuseColor = new CGL.Uniform(PBRShader, "4f", "_Albedo", inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA);
const inRoughnessUniform = new CGL.Uniform(PBRShader, "f", "_Roughness", 0.5);
const inMetalnessUniform = new CGL.Uniform(PBRShader, "f", "_Metalness", 0);

PBRShader.uniformColorDiffuse = inDiffuseColor;
PBRShader.uniformPbrMetalness = inMetalnessUniform;
PBRShader.uniformPbrRoughness = inRoughnessUniform;

inTexPrefiltered.onChange = updateIBLTexDefines;

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
inToggleGS.onChange = () =>
{
    PBRShader.toggleDefine("DONT_USE_GS", inToggleGS);
};
inToggleGR.onChange = () =>
{
    PBRShader.toggleDefine("DONT_USE_GR", inToggleGR);
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

op.preRender = function ()
{
    PBRShader.bind();
    doRender();
};

function updateIBLTexDefines()
{
    inMipLevels.setUiAttribs({ "greyout": !inTexPrefiltered.get() });
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
        op.setUiError("noPbrEnv", null);
    }
    else
    {
        op.setUiError("noPbrEnv", "No PBR precompute environment setup found in branch");
        PBRShader.pushTexture(inIBLLUTUniform, CGL.Texture.getEmptyTexture(cgl).tex);
        PBRShader.pushTexture(inIrradianceUniform, CGL.Texture.getEmptyCubemapTexture(cgl).tex, cgl.gl.TEXTURE_CUBE_MAP);
        PBRShader.pushTexture(inPrefilteredUniform, CGL.Texture.getEmptyCubemapTexture(cgl).tex, cgl.gl.TEXTURE_CUBE_MAP);
        inMipLevelsUniform.setValue(7);
    }

    if (inTexIBLLUT.get())
    {
        op.setUiError("noPbrEnv", null);
        PBRShader.pushTexture(inIBLLUTUniform, inTexIBLLUT.get().tex);
        inMipLevelsUniform.setValue(inMipLevels.get());
        if (inTexIrradiance.get()) PBRShader.pushTexture(inIrradianceUniform, inTexIrradiance.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        if (inTexPrefiltered.get()) PBRShader.pushTexture(inPrefilteredUniform, inTexPrefiltered.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
    }

    if (inTexAlbedo.get()) PBRShader.pushTexture(inAlbedoUniform, inTexAlbedo.get().tex);
    if (inTexAORM.get()) PBRShader.pushTexture(inAORMUniform, inTexAORM.get().tex);
    if (inTexNormal.get()) PBRShader.pushTexture(inNormalUniform, inTexNormal.get().tex);

    if (!inTexAORM.get())
    {
        inRoughnessUniform.setValue(inRoughness.get());
        inMetalnessUniform.setValue(inMetalness.get());
    }

    // if (inTonemappingExposure.get()) inTonemappingExposureUniform.setValue(inTonemappingExposure.get());
    if (inDiffuseIntensity.get()) inDiffuseIntensityUniform.setValue(inDiffuseIntensity.get());
    if (inSpecularIntensity.get()) inSpecularIntensityUniform.setValue(inSpecularIntensity.get());

    outTrigger.trigger();
    cgl.popShader();
}
