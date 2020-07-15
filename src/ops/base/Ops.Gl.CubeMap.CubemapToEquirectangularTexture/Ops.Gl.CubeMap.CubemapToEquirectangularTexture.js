const cgl = op.patch.cgl;

const inCubemap = op.inObject("Cubemap");
const inEquirect = op.inBool("Equirectangular", false);
const inRefresh = op.inTriggerButton("Refresh");
const outProjection = op.outTexture("Cubemap Projection");

const mesh = CGL.MESHES.getSimpleRect(cgl, "fullscreenRectangle");

// * FRAMEBUFFER *
var fb = null;
const IS_WEBGL_1 = cgl.glVersion == 1;

if (IS_WEBGL_1) {
    fb = new CGL.Framebuffer(cgl, 512, 512, {
        isFloatingPointTexture: true,
        filter: CGL.Texture.FILTER_LINEAR,
        wrap: CGL.Texture.WRAP_REPEAT
    });
}
else {
    fb = new CGL.Framebuffer2(cgl,512,512, {
        isFloatingPointTexture: true,
        filter: CGL.Texture.FILTER_LINEAR,
        wrap: CGL.Texture.WRAP_REPEAT,
    });
}

const projectionShader = new CGL.Shader(cgl, "cubemapProjection");
projectionShader.offScreenPass = true;
const uniformCubemap = new CGL.Uniform(projectionShader, 't', 'cubemap', 0);

projectionShader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
projectionShader.setSource(attachments.projection_vert, attachments.projection_frag);

let projectionHasRendered = false;
inRefresh.onTriggered = () => renderProjection();
inEquirect.onChange = () => {
    projectionShader.toggleDefine("EQUIRECTANGULAR", inEquirect);
    renderProjection();
}

function renderProjection() {
    if (!inCubemap.get()) return;
    projectionShader.popTextures();
    cgl.frameStore.renderOffscreen = true;

    fb.renderStart(cgl);
    projectionShader.pushTexture(uniformCubemap, inCubemap.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
    mesh.render(projectionShader);
    fb.renderEnd();
    cgl.frameStore.renderOffscreen = false;
    outProjection.set(null);
    outProjection.set(fb.getTextureColor());
    projectionHasRendered = true;
}