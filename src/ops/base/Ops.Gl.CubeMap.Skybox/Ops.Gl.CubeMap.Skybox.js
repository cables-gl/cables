const
    cgl = op.patch.cgl,
    inTrigger = op.inTrigger("Trigger In"),
    inRender = op.inBool("Render", true),
    inTexture = op.inTexture("Skybox"),
    inRot = op.inFloat("Rotate", 0),

    inRGBE = op.inBool("RGBE Format", false),
    inExposure = op.inFloat("Exposure", 1),
    inGamma = op.inFloat("Gamma", 2.2),

    outTrigger = op.outTrigger("Trigger Out");

const geometry = new CGL.Geometry("unit cube");

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
const skyboxShader = new CGL.Shader(cgl, "skybox");
const uniformSkybox = new CGL.Uniform(skyboxShader, "t", "skybox", 0);
const uniExposure = new CGL.Uniform(skyboxShader, "2f", "expGamma", inExposure, inGamma);

if (cgl.glVersion == 1) skyboxShader.enableExtension("GL_EXT_shader_texture_lod");

skyboxShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
skyboxShader.setSource(attachments.skybox_vert, attachments.skybox_frag);
skyboxShader.offScreenPass = true;

inTexture.onChange =
inRGBE.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    skyboxShader.toggleDefine("RGBE", inRGBE.get());
    const b = inTexture.get() && inTexture.get().cubemap;

    skyboxShader.toggleDefine("TEX_FORMAT_CUBEMAP", b);
    skyboxShader.toggleDefine("TEX_FORMAT_EQUIRECT", !b);
}

inTrigger.onTriggered = () =>
{
    if (!inTexture.get() || !inRender.get())
    {
        outTrigger.trigger();
        return;
    }

    skyboxShader.popTextures();

    cgl.pushModelMatrix();

    if (!inTexture.get().cubemap && inTexture.get().filter !== CGL.Texture.FILTER_LINEAR)
        op.setUiError("linearFilter", "If there is a seam in the skybox, try changing the texture filter to linear!", 0);
    else
        op.setUiError("linearFilter", null);

    mat4.rotateY(cgl.mMatrix, cgl.mMatrix, inRot.get() * CGL.DEG2RAD);

    if (inTexture.get().tex)
        skyboxShader.pushTexture(uniformSkybox, inTexture.get().tex);
    else if (inTexture.get().cubemap)
        skyboxShader.pushTexture(uniformSkybox, inTexture.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);

    mesh.render(skyboxShader);

    cgl.popModelMatrix();
    cgl.popDepthFunc();

    outTrigger.trigger();
};
