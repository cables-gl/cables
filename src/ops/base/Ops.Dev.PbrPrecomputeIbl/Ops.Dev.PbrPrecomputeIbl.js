// utility
const cgl = op.patch.cgl;
const IS_WEBGL_1 = cgl.glVersion == 1;

const geometry = new CGL.Geometry("unit cube");
geometry.vertices = new Float32Array([
    -1.0, 1.0, -1.0,
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0,

    -1.0, -1.0, 1.0,
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0,

    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,

    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0
]);
const mesh = new CGL.Mesh(cgl, geometry);
const fullscreenRectangle = CGL.MESHES.getSimpleRect(cgl, "fullscreenRectangle");
// inputs
const inTrigger = op.inTrigger("render");
const inTriggerRecapture = op.inTriggerButton("recapture");

const inCubemap = op.inTexture("environment texture (rgbe)");

const inIrradianceSize = op.inDropDown("irradiance map size", [16, 32, 64], 64);
const inPrefilteredSize = op.inDropDown("pre-filtered environment size", [64, 128], 128);
const inIBLLUTSize = op.inDropDown("IBL LUT size", [128, 256, 512, 1024], 256);
const inToggleRGBE = op.inBool("environment does not contain RGBE data", false);

let IrradianceSizeChanged = true;
let PrefilteredSizeChanged = true;
let IBLLUTSizeChanged = true;
inIrradianceSize.onChange = () => IrradianceSizeChanged = true;
inPrefilteredSize.onChange = () => PrefilteredSizeChanged = true;
inIBLLUTSize.onChange = () => IBLLUTSizeChanged = true;

// outputs
const outTrigger = op.outTrigger("next");

const outTexIBLLUT = op.outTexture("IBL LUT");
const outTexIrradiance = op.outTexture("cubemap (diffuse irradiance)");
const outTexPrefiltered = op.outTexture("cubemap (pre-filtered environment map)");
const outMipLevels = op.outNumber("Number of Pre-filtered mip levels");
// UI stuff
op.toWorkPortsNeedToBeLinked(inCubemap);

// globals
let IrradianceFrameBuffer = null;
let PrefilteredTexture = null;
let PrefilteredFrameBuffer = null;
let IBLLUTFrameBuffer = null;
let maxMipLevels = null;

const IrradianceShader = new CGL.Shader(cgl, "IrradianceShader");
const PrefilteringShader = new CGL.Shader(cgl, "PrefilteringShader");
IrradianceShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
PrefilteringShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

if (cgl.glVersion == 1)
{
    if (!cgl.gl.getExtension("EXT_shader_texture_lod"))
    {
        op.log("no EXT_shader_texture_lod texture extension");
        throw "no EXT_shader_texture_lod texture extension";
    }
    else
    {
        IrradianceShader.enableExtension("GL_EXT_shader_texture_lod");
        PrefilteringShader.enableExtension("GL_EXT_shader_texture_lod");
        cgl.gl.getExtension("OES_texture_float");
        cgl.gl.getExtension("OES_texture_float_linear");
        cgl.gl.getExtension("OES_texture_half_float");
        cgl.gl.getExtension("OES_texture_half_float_linear");

        cgl.gl.getExtension("WEBGL_color_buffer_float");

        IrradianceShader.enableExtension("GL_OES_standard_derivatives");
        IrradianceShader.enableExtension("GL_OES_texture_float");
        IrradianceShader.enableExtension("GL_OES_texture_float_linear");
        IrradianceShader.enableExtension("GL_OES_texture_half_float");
        IrradianceShader.enableExtension("GL_OES_texture_half_float_linear");
        PrefilteringShader.enableExtension("GL_OES_standard_derivatives");
        PrefilteringShader.enableExtension("GL_OES_texture_float");
        PrefilteringShader.enableExtension("GL_OES_texture_float_linear");
        PrefilteringShader.enableExtension("GL_OES_texture_half_float");
        PrefilteringShader.enableExtension("GL_OES_texture_half_float_linear");
    }
}

let filteringInfo = [0, 0];
IrradianceShader.offScreenPass = true;
const uniformIrradianceCubemap = new CGL.Uniform(IrradianceShader, "t", "EquiCubemap", 0);
const uniformFilteringInfo = new CGL.Uniform(IrradianceShader, "2f", "filteringInfo", filteringInfo);
IrradianceShader.setSource(attachments.irradiance_vert, attachments.irradiance_frag);

let prefilteringInfo = [0, 0];
PrefilteringShader.offScreenPass = true;
const uniformPrefilteringCubemap = new CGL.Uniform(PrefilteringShader, "t", "EquiCubemap", 0);
const uniformPrefilteringRoughness = new CGL.Uniform(PrefilteringShader, "f", "roughness", 0);
const uniformPrefilteringInfo = new CGL.Uniform(PrefilteringShader, "2f", "filteringInfo", prefilteringInfo);
PrefilteringShader.setSource(attachments.prefiltering_vert, attachments.prefiltering_frag);

const IBLLUTShader = new CGL.Shader(cgl, "IBLLUTShader");
IBLLUTShader.offScreenPass = true;
IBLLUTShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
IBLLUTShader.setSource(attachments.IBLLUT_vert, attachments.IBLLUT_frag);

inToggleRGBE.onChange = () =>
{
    IrradianceShader.toggleDefine("DONT_USE_RGBE_CUBEMAPS", inToggleRGBE);
    PrefilteringShader.toggleDefine("DONT_USE_RGBE_CUBEMAPS", inToggleRGBE);

    IrradianceSizeChanged = true;
    PrefilteredSizeChanged = true;
};

// utility functions
function captureIrradianceCubemap(size)
{
    if (IrradianceFrameBuffer)
    {
        IrradianceFrameBuffer.setSize(Number(size), Number(size));
    }
    else
    {
        IrradianceFrameBuffer = new CGL.CubemapFramebuffer(cgl, Number(size), Number(size), {
            "isFloatingPointTexture": true, // TODO
            "filter": CGL.Texture.FILTER_POINT, // due to banding with rgbe
            "wrap": CGL.Texture.WRAP_CLAMP
        });
    }

    filteringInfo[0] = size;
    filteringInfo[1] = 1.0 + Math.floor(Math.log(size) * 1.44269504088896340736);

    IrradianceShader.popTextures();
    IrradianceShader.pushTexture(uniformIrradianceCubemap, inCubemap.get().tex);

    IrradianceFrameBuffer.renderStart(cgl);
    for (let i = 0; i < 6; i += 1)
    {
        IrradianceFrameBuffer.renderStartCubemapFace(i);

        cgl.gl.clearColor(0, 0, 0, 0);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
        mesh.render(IrradianceShader);
        IrradianceFrameBuffer.renderEndCubemapFace();
    }
    IrradianceFrameBuffer.renderEnd();

    outTexIrradiance.set(null); // pandur
    outTexIrradiance.set(IrradianceFrameBuffer.getTextureColor());
}

function capturePrefilteredCubemap(size)
{
    let captureFBO = new CGL.CubemapFramebuffer(cgl, Number(size), Number(size), {
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_LINEAR,
        "wrap": CGL.Texture.WRAP_CLAMP
    });
    if (PrefilteredFrameBuffer)
    {
        PrefilteredFrameBuffer.setSize(Number(size), Number(size));
    }
    else
    {
        PrefilteredFrameBuffer = new CGL.CubemapFramebuffer(cgl, Number(size), Number(size), {
            "isFloatingPointTexture": true, // TODO
            "filter": CGL.Texture.FILTER_MIPMAP,
            "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE
        });
    }
    cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, PrefilteredFrameBuffer.getTextureColor().tex);
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_WRAP_R, cgl.gl.CLAMP_TO_EDGE);
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.LINEAR_MIPMAP_LINEAR);
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.LINEAR);
    cgl.gl.generateMipmap(cgl.gl.TEXTURE_CUBE_MAP); // make sure memory is assigned for mips

    maxMipLevels = 1.0 + Math.floor(Math.log(Number(size)) * 1.44269504088896340736);
    outMipLevels.set(maxMipLevels);
    prefilteringInfo[0] = size;
    prefilteringInfo[1] = maxMipLevels;

    PrefilteringShader.popTextures();
    PrefilteringShader.pushTexture(uniformPrefilteringCubemap, inCubemap.get().tex);

    for (let mip = 0; mip < maxMipLevels; ++mip)
    {
        let currentMipSize = Number(size) * Math.pow(0.5, mip);
        let roughness = mip / (maxMipLevels - 1);
        uniformPrefilteringRoughness.setValue(roughness);

        captureFBO.setSize(Number(currentMipSize), Number(currentMipSize));
        captureFBO.renderStart(cgl);
        for (let i = 0; i < 6; i += 1)
        {
            captureFBO.renderStartCubemapFace(i);
            cgl.gl.clearColor(0, 0, 0, 0);
            cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
            mesh.render(PrefilteringShader);
            cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, PrefilteredFrameBuffer.getTextureColor().tex);
            cgl.gl.copyTexImage2D(cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, mip, cgl.gl.RGBA, 0, 0, Number(currentMipSize), Number(currentMipSize), null);
            captureFBO.renderEndCubemapFace();
        }
        captureFBO.renderEnd();
    }
    captureFBO.delete();
    outTexPrefiltered.set(null);
    outTexPrefiltered.set(PrefilteredFrameBuffer.getTextureColor());
}

function computeIBLLUT(size)
{
    if (IBLLUTFrameBuffer)
    {
        IBLLUTFrameBuffer.setSize(Number(size), Number(size));
    }
    else
    {
        if (IS_WEBGL_1)
        {
            IBLLUTFrameBuffer = new CGL.Framebuffer(cgl, size, size, {
                "isFloatingPointTexture": true,
                "filter": CGL.Texture.FILTER_LINEAR,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE
            });
        }
        else
        {
            IBLLUTFrameBuffer = new CGL.Framebuffer2(cgl, size, size, {
                "isFloatingPointTexture": true,
                "filter": CGL.Texture.FILTER_LINEAR,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
            });
        }
    }

    cgl.frameStore.renderOffscreen = true;
    IBLLUTFrameBuffer.renderStart(cgl);

    fullscreenRectangle.render(IBLLUTShader);

    IBLLUTFrameBuffer.renderEnd();
    cgl.frameStore.renderOffscreen = false;

    outTexIBLLUT.set(IBLLUTFrameBuffer.getTextureColor());
}

inCubemap.onChange = () =>
{
    PrefilteredSizeChanged =
    IrradianceSizeChanged = true;
};

// onTriggered
inTrigger.onTriggered = function ()
{
    if (!inCubemap.get())
    {
        outTrigger.trigger();
        return;
    }

    uniformFilteringInfo.setValue(filteringInfo);
    uniformPrefilteringInfo.setValue(prefilteringInfo);

    if (IBLLUTSizeChanged)
    {
        computeIBLLUT(Number(inIBLLUTSize.get()));
        IBLLUTSizeChanged = false;
    }

    if (PrefilteredSizeChanged)
    {
        capturePrefilteredCubemap(Number(inPrefilteredSize.get()));
        PrefilteredSizeChanged = false;
    }

    if (IrradianceSizeChanged)
    {
        captureIrradianceCubemap(Number(inIrradianceSize.get()));
        IrradianceSizeChanged = false;
    }
    outTrigger.trigger();
};

inTriggerRecapture.onTriggered = function ()
{
    IrradianceSizeChanged = true;
    PrefilteredSizeChanged = true;
};
