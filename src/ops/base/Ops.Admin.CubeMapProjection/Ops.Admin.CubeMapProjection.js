const cgl = op.patch.cgl;

const inTrigger = op.inTrigger("In");
const inCubemap = op.inObject("Cubemap");
const inReset = op.inTriggerButton("Reset");
const outTrigger = op.outTrigger("Out");
const outProjection = op.outTexture("Cubemap Projection");

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
const projectionEffect = new CGL.TextureEffect(cgl, { isFloatingPointTexture: true });
const projectionShader = new CGL.Shader(cgl, "cubemapProjection");
projectionShader.offScreenPass = true;
const uniformCubemap = new CGL.Uniform(projectionShader, 't', 'cubemap', 0);

projectionShader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
projectionShader.setSource(projectionShader.getDefaultVertexShader(), attachments.projection_frag);

let projectionHasRendered = false;
inReset.onTriggered = () => { projectionHasRendered = false; }

function renderProjection() {
    /*
        cgl.frameStore.renderOffscreen = true;


    cubeMapEffect.setSourceTexture(framebuffer.getTextureColor()); // take shadow map as source

    cubeMapEffect.startEffect();
    cgl.pushShader(projectionShader);

    cubeMapEffect.bind();

    cgl.setTexture(0, cubemap, cgl.gl.TEXTURE_CUBE_MAP);

    cgl.setTexture(0, cubeMapEffect.getCurrentSourceTexture().tex);

    cubeMapEffect.finish();

    cubeMapEffect.endEffect();
    cgl.popShader();
    cgl.frameStore.renderOffscreen = false;
    outProjection.set(null);
    outProjection.set(cubeMapEffect.getCurrentSourceTexture());
    outCubemap.set(null);
    outCubemap.set(newLight.shadowCubeMap);
    #*/
    cgl.frameStore.renderOffscreen = true;

    projectionEffect.setSourceTexture(fb.getTextureColor());

    projectionEffect.startEffect();
    cgl.pushShader(projectionShader);

    projectionEffect.bind();

    op.log("ayay", inCubemap.get().cubemap);
    // cgl.setTexture(0, projectionEffect.getCurrentSourceTexture().tex);
    cgl.setTexture(0, inCubemap.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);


    projectionEffect.finish();
    projectionEffect.endEffect();

    cgl.popShader();
    cgl.frameStore.renderOffscreen = false;

    outProjection.set(null);
    op.log(projectionEffect.getCurrentSourceTexture());
    outProjection.set(projectionEffect.getCurrentSourceTexture());
    projectionHasRendered = true;
}
inTrigger.onTriggered = () => {
    if(!inCubemap.get()) {
        outTrigger.trigger();
        return;
    }
    if (!projectionHasRendered) {
        op.log("amk2rorjasid");
        renderProjection();
    }
    outTrigger.trigger();
}