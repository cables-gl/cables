const cgl = op.patch.cgl;
const inTrigger = op.inTrigger("Trigger In");
const inRender = op.inBool("Render", true);
const inTexture = op.inObject("Skybox");
const inRot = op.inFloat("Rotate", 0);

const inRGBE = op.inBool("RGBE Format", false);
const inExposure = op.inFloat("Exposure", 1);
const inGamma = op.inFloat("Gamma", 2.2);

const outTrigger = op.outTrigger("Trigger Out");

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

skyboxShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
skyboxShader.setSource(attachments.skybox_vert, attachments.skybox_frag);
skyboxShader.offScreenPass = true;

inRGBE.onChange = () =>
{
    skyboxShader.toggleDefine("RGBE", inRGBE.get());
    inGamma.setUiAttribs({ "greyout": !inRGBE.get() });
    inExposure.setUiAttribs({ "greyout": !inRGBE.get() });
};

inTexture.onChange = () =>
{
    if (inTexture.get() && inTexture.get().cubemap)
    {
        skyboxShader.define("TEX_FORMAT_CUBEMAP");
        skyboxShader.removeDefine("TEX_FORMAT_EQUIRECT");
    }
    else
    {
        skyboxShader.removeDefine("TEX_FORMAT_CUBEMAP");
        skyboxShader.define("TEX_FORMAT_EQUIRECT");
    }
};

inTrigger.onTriggered = () =>
{
    if (!inTexture.get())
    {
        outTrigger.trigger();
        return;
    }

    if (inRender.get())
    {
        skyboxShader.popTextures();

        cgl.pushModelMatrix();
        cgl.pushDepthFunc(cgl.gl.LEQUAL);

        if (!inTexture.get().cubemap && inTexture.get().filter !== CGL.Texture.FILTER_LINEAR)
        {
            op.setUiError("linearFilter", "If there is a seam in the skybox, try changing the texture filter to linear!", 1);
        }
        else
        {
            op.setUiError("linearFilter", null);
        }

        mat4.rotateY(cgl.mMatrix, cgl.mMatrix, inRot.get() * CGL.DEG2RAD);

        if (inTexture.get().tex)
        {
            skyboxShader.pushTexture(uniformSkybox, inTexture.get().tex);
        }
        else if (inTexture.get().cubemap)
        {
            skyboxShader.pushTexture(uniformSkybox, inTexture.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        }
        mesh.render(skyboxShader);

        cgl.popModelMatrix();
        cgl.popDepthFunc();
    }

    outTrigger.trigger();
};
