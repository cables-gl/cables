const cgl = op.patch.cgl;

const inTrigger = op.inTrigger("In");
const inRender = op.inBool("Render", false);
const inTexture = op.inTexture("Equirectangular Map");
const inForwardToOut = op.inBool("Forward to out", true);
const outTrigger = op.outTrigger("Out");
const outCubemap = op.outObject("Cubemap Projection");

const geometry = new CGL.Geometry("unit cube");

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

if (IS_WEBGL_1) {
    fb = new CGL.Framebuffer(cgl, 512, 512, {
        isFloatingPointTexture: true,
        filter: CGL.Texture.FILTER_LINEAR,
        wrap: CGL.Texture.WRAP_CLAMP_TO_EDGE
    });
}
else {
    fb = new CGL.Framebuffer2(cgl,512,512, {
        isFloatingPointTexture: true,
        filter: CGL.Texture.FILTER_LINEAR,
        wrap: CGL.Texture.WRAP_CLAMP_TO_EDGE,
    });
}
const cubemap = new CGL.Cubemap(cgl, { size: 512 });
cubemap.initializeCubemap();

const equirectToCubeEffect = new CGL.TextureEffect(cgl, { isFloatingPointTexture: true });
const equiToCubeShader = new CGL.Shader(cgl, "equirectToCube");
const uniformCubemap = new CGL.Uniform(equiToCubeShader, 't', 'equirectangularMap', 1);
equiToCubeShader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
equiToCubeShader.setSource(attachments.equirect_to_cube_vert, attachments.equirect_to_cube_frag);
equiToCubeShader.offScreenPass = true;
inTrigger.onTriggered = () => {
    if(!inTexture.get()) {
        outTrigger.trigger();
        return;
    }

    if (inRender.get()) {
        cgl.setTexture(1, inTexture.get().tex);
        cgl.pushDepthFunc(cgl.gl.LEQUAL);
        mesh.render(equiToCubeShader);
        cgl.popDepthFunc();
    }

    if (inForwardToOut.get()) {
        fb.renderStart(cgl);
        cgl.frameStore.renderOffscreen = true;

        cubemap.renderCubemap(equiToCubeShader, () => mesh.render(equiToCubeShader));
        outCubemap.set(null);
        outCubemap.set(cubemap.getCubemap());

        cgl.frameStore.renderOffscreen = false;
        cgl.pushShader(equiToCubeShader);
        fb.renderEnd();
    }

    outTrigger.trigger();
}