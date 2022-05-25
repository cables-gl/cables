// utility
const cgl = op.patch.cgl;
const IS_WEBGL_1 = cgl.glVersion == 1;

const BB = new CGL.BoundingBox();
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
// const inTriggerRecapture = op.inTriggerButton("recapture");

const inCubemap = op.inTexture("RGBE Environment map");

const inIrradianceSize = op.inDropDown("Size Irradiance map", [16, 32, 64], 64);
const inPrefilteredSize = op.inDropDown("Size pre-filtered environment", [64, 128], 128);
const inIBLLUTSize = op.inDropDown("Size IBL LUT", [128, 256, 512, 1024], 256);
const inToggleRGBE = op.inBool("Environment map does not contain RGBE data", false);
const inRotation = op.inFloat("Rotation", 0.0);
const inUseParallaxCorrection = op.inValueBool("Use parallax correction", false);

const inPCOriginX = op.inFloat("center X", 0);
const inPCOriginY = op.inFloat("center Y", 1.8);
const inPCOriginZ = op.inFloat("center Z", 0);
const inPCboxMinX = op.inFloat("Box min X", -1);
const inPCboxMinY = op.inFloat("Box min Y", -1);
const inPCboxMinZ = op.inFloat("Box min Z", -1);
const inPCboxMaxX = op.inFloat("Box max X", 1);
const inPCboxMaxY = op.inFloat("Box max Y", 1);
const inPCboxMaxZ = op.inFloat("Box max Z", 1);

op.setPortGroup("parallax correction", [
    inUseParallaxCorrection,
    inPCOriginX,
    inPCOriginY,
    inPCOriginZ,
    inPCboxMinX,
    inPCboxMinY,
    inPCboxMinZ,
    inPCboxMaxX,
    inPCboxMaxY,
    inPCboxMaxZ
]);

let IrradianceSizeChanged = true;
let PrefilteredSizeChanged = true;
let IBLLUTSizeChanged = true;
inIrradianceSize.onChange = () => { return IrradianceSizeChanged = true; };
inPrefilteredSize.onChange = () => { return PrefilteredSizeChanged = true; };
inIBLLUTSize.onChange = () => { return IBLLUTSizeChanged = true; };

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
const pbrEnv = {};
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
const uniformRotation = new CGL.Uniform(IrradianceShader, "f", "rotation", 0);
IrradianceShader.setSource(attachments.irradiance_vert, attachments.irradiance_frag);

let prefilteringInfo = [0, 0];
PrefilteringShader.offScreenPass = true;
const uniformPrefilteringCubemap = new CGL.Uniform(PrefilteringShader, "t", "EquiCubemap", 0);
const uniformPrefilteringRoughness = new CGL.Uniform(PrefilteringShader, "f", "roughness", 0);
const uniformPrefilteringRotation = new CGL.Uniform(PrefilteringShader, "f", "rotation", 0);
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

inRotation.onChange = () =>
{
    PrefilteredSizeChanged =
    IrradianceSizeChanged = true;
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
    uniformRotation.setValue(inRotation.get() / 360.0);

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
    // cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_WRAP_R, cgl.gl.CLAMP_TO_EDGE);
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.LINEAR_MIPMAP_LINEAR);
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.LINEAR);
    cgl.gl.generateMipmap(cgl.gl.TEXTURE_CUBE_MAP); // make sure memory is assigned for mips

    maxMipLevels = 1.0 + Math.floor(Math.log(Number(size)) * 1.44269504088896340736);
    outMipLevels.set(maxMipLevels);
    prefilteringInfo[0] = size;
    prefilteringInfo[1] = maxMipLevels;

    PrefilteringShader.popTextures();
    PrefilteringShader.pushTexture(uniformPrefilteringCubemap, inCubemap.get().tex);
    uniformPrefilteringRotation.setValue(inRotation.get() / 360.0);

    for (let mip = 0; mip <= maxMipLevels; ++mip)
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
    cgl.setTexture(0, null);

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
    if (inCubemap.get())
        op.setUiError("nocubemapinput", null);

    PrefilteredSizeChanged =
    IrradianceSizeChanged = true;
};

function drawHelpers()
{
    gui.setTransformGizmo({
        "posX": inPCOriginX,
        "posY": inPCOriginY,
        "posZ": inPCOriginZ,
    });
    gui.setTransformGizmo({
        "posX": inPCboxMinX,
        "posY": inPCboxMinY,
        "posZ": inPCboxMinZ,
    }, 1);
    gui.setTransformGizmo({
        "posX": inPCboxMaxX,
        "posY": inPCboxMaxY,
        "posZ": inPCboxMaxZ,
    }, 2);
    if (CABLES.UI.renderHelper)
    {
        cgl.pushShader(CABLES.GL_MARKER.getDefaultShader(cgl));
    }
    else
    {
        cgl.pushShader(CABLES.GL_MARKER.getSelectedShader(cgl));
    }
    cgl.pushModelMatrix();
    // translate
    mat4.translate(cgl.mMatrix, cgl.mMatrix, [(inPCboxMinX.get() + inPCboxMaxX.get()) / 2.0, (inPCboxMinY.get() + inPCboxMaxY.get()) / 2.0, (inPCboxMinZ.get() + inPCboxMaxZ.get()) / 2.0]);
    // scale to bounds
    mat4.scale(cgl.mMatrix, cgl.mMatrix, [(inPCboxMaxX.get() - inPCboxMinX.get()) / 2.0, (inPCboxMaxY.get() - inPCboxMinY.get()) / 2.0, (inPCboxMaxZ.get() - inPCboxMinZ.get()) / 2.0]);
    // draw
    BB.render(cgl);
    cgl.popShader();
    cgl.popModelMatrix();
}

// onTriggered
inTrigger.onTriggered = function ()
{
    if (!inCubemap.get())
    {
        outTrigger.trigger();
        op.setUiError("nocubemapinput", "No Environment Texture connected");
        return;
    }

    uniformFilteringInfo.setValue(filteringInfo);
    uniformPrefilteringInfo.setValue(prefilteringInfo);

    if (!cgl.frameStore.shadowPass)
    {
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
    }

    pbrEnv.texIBLLUT = outTexIBLLUT.get();
    pbrEnv.texDiffIrr = outTexIrradiance.get();
    pbrEnv.texPreFiltered = outTexPrefiltered.get();
    pbrEnv.texPreFilteredMipLevels = outMipLevels.get();

    pbrEnv.UseParallaxCorrection = inUseParallaxCorrection.get();
    pbrEnv.PCOrigin = [inPCOriginX.get(), inPCOriginY.get(), inPCOriginZ.get()];
    pbrEnv.PCboxMin = [inPCboxMinX.get(), inPCboxMinY.get(), inPCboxMinZ.get()];
    pbrEnv.PCboxMax = [inPCboxMaxX.get(), inPCboxMaxY.get(), inPCboxMaxZ.get()];

    cgl.frameStore.pbrEnvStack = cgl.frameStore.pbrEnvStack || [];
    cgl.frameStore.pbrEnvStack.push(pbrEnv);

    if (cgl.shouldDrawHelpers(op) && pbrEnv.UseParallaxCorrection && !cgl.frameStore.shadowPass) drawHelpers();

    outTrigger.trigger();
    cgl.frameStore.pbrEnvStack.pop();
};

// inTriggerRecapture.onTriggered = function ()
// {
//     IrradianceSizeChanged = true;
//     PrefilteredSizeChanged = true;
// };
