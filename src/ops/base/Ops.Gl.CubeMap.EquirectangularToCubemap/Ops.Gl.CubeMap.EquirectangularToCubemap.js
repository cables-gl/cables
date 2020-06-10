const cgl = op.patch.cgl;

const inTexture = op.inTexture("Equirectangular Map");
const inRefresh = op.inTriggerButton("Refresh");
const inSize = op.inDropDown("Cubemap Size",[32,64, 128, 256, 512, 1024, 2048], 512);
const inAdvanced = op.inBool("Advanced", false);
const inTextureFilter = op.inSwitch("Filter", ['Nearest', 'Linear'], 'Linear');
op.setPortGroup("Cubemap Options", [inSize, inAdvanced, inTextureFilter]);
const outCubemap = op.outObject("Cubemap Projection");

inTextureFilter.setUiAttribs({ greyout: !inAdvanced.get() });
const geometry = new CGL.Geometry("unit cube");

inAdvanced.onChange = () => inTextureFilter.setUiAttribs({ greyout: !inAdvanced.get() });
geometry.vertices = new Float32Array([
    // * NOTE: tex coords not needed for cubemapping
    -1.0,  1.0, -1.0,
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,

    -1.0, -1.0,  1.0,
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    -1.0, -1.0,  1.0,

     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,

    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0
]);
const mesh = new CGL.Mesh(cgl, geometry);

// * FRAMEBUFFER *
var fb = null;
const IS_WEBGL_1 = cgl.glVersion == 1;

let cubemap = null;

const equirectToCubeEffect = new CGL.TextureEffect(cgl, { isFloatingPointTexture: true });
const equiToCubeShader = new CGL.Shader(cgl, "equirectToCube");
const uniformEquirectangularMap = new CGL.Uniform(equiToCubeShader, 't', 'equirectangularMap', 0);
equiToCubeShader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
equiToCubeShader.setSource(attachments.equirect_to_cube_vert, attachments.equirect_to_cube_frag);
equiToCubeShader.offScreenPass = true;

inTexture.onChange = inSize.onChange = inTextureFilter.onChange = resetCubemap;

function resetCubemap() {
    if (!inTexture.get()) {
        outCubemap.set(null);
        return;
    }
    createCubemap();
    renderCubemap();

}

function createCubemap() {
    if (!inTexture.get()) {
        return;
    }

    cubemap = null;

    if (fb) fb.dispose();

    const textureOptions = {
        isFloatingPointTexture: true,
        filter: CGL.Texture.FILTER_LINEAR,
        wrap: CGL.Texture.WRAP_CLAMP_TO_EDGE,
    }

    if (inAdvanced.get()) {
        textureOptions.filter = CGL.Texture["FILTER_" + inTextureFilter.get().toUpperCase()];
    }
    if (IS_WEBGL_1) {
        fb = new CGL.Framebuffer(cgl, Number(inSize.get()), Number(inSize.get()), textureOptions);
    }
    else {
        fb = new CGL.Framebuffer2(cgl,Number(inSize.get()),Number(inSize.get()), textureOptions);
    }

    cubemap = new CGL.Cubemap(cgl, { size: Number(inSize.get()) });
    cubemap.initializeCubemap();
}

function renderCubemap() {
    if (!inTexture.get()) {
        outCubemap.set(null);
        return;
    }

    if (!cubemap) createCubemap();

    equiToCubeShader.popTextures();

    cgl.frameStore.renderOffscreen = true;

    if (inTexture.get().tex) {
        fb.renderStart(cgl);

        equiToCubeShader.pushTexture(uniformEquirectangularMap, inTexture.get().tex);

        cubemap.renderCubemap(equiToCubeShader, () => mesh.render(equiToCubeShader));

        fb.renderEnd();
        cgl.frameStore.renderOffscreen = false;

        outCubemap.set(null);
        outCubemap.set(cubemap.getCubemap());
    }
}

inRefresh.onTriggered = renderCubemap;





