const cgl = op.patch.cgl;
const mesh = CGL.MESHES.getSimpleRect(cgl, "fullscreenRectangle");

const inTrigger = op.inTrigger("In Trigger");
const inCubemap = op.inObject("Cubemap");
const inEquirect = op.inBool("Equirectangular", false);
const inWidth = op.inInt("Width", 512);
const inHeight = op.inInt("Height", 512);

op.setPortGroup("Options", [inWidth, inHeight, inEquirect]);
const outTrigger = op.outTrigger("Out Trigger");
const outProjection = op.outTexture("Cubemap Projection");

let sizeChanged = false;

inWidth.onChange = inHeight.onChange = () =>
{
    sizeChanged = true;
};
// * FRAMEBUFFER *
let fb = null;
const IS_WEBGL_1 = cgl.glVersion == 1;

if (IS_WEBGL_1)
{
    fb = new CGL.Framebuffer(cgl, inWidth.get(), inHeight.get(), {
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_LINEAR,
        "wrap": CGL.Texture.WRAP_REPEAT
    });
}
else
{
    fb = new CGL.Framebuffer2(cgl, inWidth.get(), inHeight.get(), {
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_LINEAR,
        "wrap": CGL.Texture.WRAP_REPEAT,
    });
}

const projectionShader = new CGL.Shader(cgl, "cubemapProjection");
projectionShader.offScreenPass = true;
const uniformCubemap = new CGL.Uniform(projectionShader, "t", "cubemap", 0);

projectionShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
projectionShader.setSource(attachments.projection_vert, attachments.projection_frag);

projectionShader.toggleDefine("EQUIRECTANGULAR", inEquirect);

inTrigger.onTriggered = function ()
{
    if (!inCubemap.get())
    {
        outTrigger.trigger();
        return;
    }

    if (sizeChanged)
    {
        if (fb) fb.setSize(inWidth.get(), inHeight.get());
        sizeChanged = false;
    }
    projectionShader.popTextures();

    cgl.tempData.renderOffscreen = true;

    fb.renderStart(cgl);
    projectionShader.pushTexture(uniformCubemap, inCubemap.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
    mesh.render(projectionShader);
    fb.renderEnd();
    cgl.tempData.renderOffscreen = false;

    outProjection.set(null);
    outProjection.set(fb.getTextureColor());

    outTrigger.trigger();
};
