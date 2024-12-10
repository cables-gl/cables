const cgl = op.patch.cgl;
const geometry = new CGL.Geometry("unit cube");

const inTrigger = op.inTrigger("Trigger In");
const inTexture = op.inTexture("Equirectangular Map");

const inSize = op.inDropDown("Cubemap Size", [32, 64, 128, 256, 512, 1024, 2048], 512);
const inAdvanced = op.inBool("Advanced", false);
const inTextureFilter = op.inSwitch("Filter", ["Nearest", "Linear"], "Linear");
op.setPortGroup("Cubemap Options", [inSize, inAdvanced, inTextureFilter]);
const outTrigger = op.outTrigger("Trigger Out");
const outCubemap = op.outTexture("Cubemap Projection");

inTextureFilter.setUiAttribs({ "greyout": !inAdvanced.get() });

inAdvanced.onChange = () => { return inTextureFilter.setUiAttribs({ "greyout": !inAdvanced.get() }); };
geometry.vertices = new Float32Array([
    // * NOTE: tex coords not needed for cubemapping
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

// * FRAMEBUFFER *
let fb = null;
const IS_WEBGL_1 = cgl.glVersion == 1;

let cubemap = null;

const equirectToCubeEffect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": true });
const equiToCubeShader = new CGL.Shader(cgl, "equirectToCube");
const uniformEquirectangularMap = new CGL.Uniform(equiToCubeShader, "t", "equirectangularMap", 0);
equiToCubeShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
equiToCubeShader.setSource(attachments.equirect_to_cube_vert, attachments.equirect_to_cube_frag);
equiToCubeShader.offScreenPass = true;

inTexture.onChange = inSize.onChange = inTextureFilter.onChange = resetCubemap;

let reinitCubemap = true;
function resetCubemap()
{
    reinitCubemap = true;
}

function createCubemap()
{
    if (!inTexture.get())
    {
        return;
    }

    if (cubemap) cubemap.dispose();
    cubemap = null;

    if (fb) fb.delete();

    const textureOptions = {
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_LINEAR,
        "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
    };

    if (inAdvanced.get())
    {
        textureOptions.filter = CGL.Texture["FILTER_" + inTextureFilter.get().toUpperCase()];
    }
    if (IS_WEBGL_1)
    {
        fb = new CGL.Framebuffer(cgl, Number(inSize.get()), Number(inSize.get()), textureOptions);
    }
    else
    {
        fb = new CGL.Framebuffer2(cgl, Number(inSize.get()), Number(inSize.get()), textureOptions);
    }

    cubemap = new CGL.CubemapFramebuffer(cgl, Number(inSize.get()), Number(inSize.get()), {});
    reinitCubemap = false;
}

inTrigger.onTriggered = function ()
{
    if (!inTexture.get())
    {
        // outCubemap.set(null);
        outTrigger.trigger();
        return;
    }

    if (reinitCubemap)
    {
        createCubemap();
    }

    equiToCubeShader.popTextures();

    cgl.tempData.renderOffscreen = true;

    if (inTexture.get() && inTexture.get().tex)
    {
        // fb.renderStart(cgl);

        equiToCubeShader.pushTexture(uniformEquirectangularMap, inTexture.get().tex);

        cgl.pushShader(equiToCubeShader);

        cubemap.renderStart();

        for (let i = 0; i < 6; i += 1)
        {
            cubemap.renderStartCubemapFace(i);
            mesh.render(equiToCubeShader);
            cubemap.renderEndCubemapFace();
        }

        cubemap.renderEnd();

        cgl.popShader();

        // fb.renderEnd();
        cgl.tempData.renderOffscreen = false;

        outCubemap.set(null);
        outCubemap.set(cubemap.getTextureColor());
    }

    outTrigger.trigger();
};
