const
    inTrigger = op.inTrigger("In Trigger"),
    inCubemap = op.inObject("Cubemap"),
    inProj = op.inSwitch("Projection", ["Equirectangular", "Cube unwrap"], "Equirectangular"),
    // inFp = op.inBool("32bit float tex", false),
    inFormat=op.inSwitch("Format",["8bit","32bit","RGBE"],"8bit"),
    inWidth = op.inInt("Width", 1024),
    inHeight = op.inInt("Height", 512),
    outTrigger = op.outTrigger("Out Trigger"),
    outProjection = op.outTexture("Result");

op.setPortGroup("Options", [inWidth,inHeight,inProj,inFormat]);
inProj.onChange = updateDefines;

const cgl = op.patch.cgl;
const mesh = CGL.MESHES.getSimpleRect(cgl, "fullscreenRectangle");
const IS_WEBGL_1 = cgl.glVersion == 1;
let sizeChanged = false;
let needsUpdate=true;
let fb = null;
const projectionShader = new CGL.Shader(cgl, "cubemapProjection");
projectionShader.offScreenPass = true;
const uniformCubemap = new CGL.Uniform(projectionShader, "t", "cubemap", 0);

projectionShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
projectionShader.setSource(attachments.projection_vert, attachments.projection_frag);

inFormat.onChange=createFb;
updateDefines();
createFb();

function createFb()
{
    if(fb)fb.dispose();

    let cgl_filter = CGL.Texture.FILTER_LINEAR;

    if (IS_WEBGL_1)
    {
        fb = new CGL.Framebuffer(cgl, inWidth.get(), inHeight.get(), {
            "isFloatingPointTexture": inFormat.get()=="32bit",
            "filter": cgl_filter,
            "wrap": CGL.Texture.WRAP_REPEAT
        });
    }
    else
    {
        fb = new CGL.Framebuffer2(cgl, inWidth.get(), inHeight.get(), {
            "isFloatingPointTexture": inFormat.get()=="32bit",
            "filter": cgl_filter,
            "wrap": CGL.Texture.WRAP_REPEAT,
        });
    }
    updateDefines();
    needsUpdate=true;
}

inWidth.onChange = inHeight.onChange = () =>
{
    sizeChanged = true;
};

inCubemap.onChange=()=>
{
    needsUpdate=true;
};

function updateDefines()
{
    projectionShader.toggleDefine("EQUIRECTANGULAR", inProj.get() == "Equirectangular");
    projectionShader.toggleDefine("RGBE", inFormat.get() == "RGBE");
    needsUpdate=true;
}


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
        needsUpdate=true;
    }

    if(needsUpdate)
    {
        projectionShader.popTextures();

        fb.renderStart(cgl);
        projectionShader.pushTexture(uniformCubemap, inCubemap.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        mesh.render(projectionShader);
        fb.renderEnd();

        outProjection.set(CGL.Texture.getEmptyTexture(cgl));
        outProjection.set(fb.getTextureColor());
        needsUpdate=false;
    }
    outTrigger.trigger();
};
