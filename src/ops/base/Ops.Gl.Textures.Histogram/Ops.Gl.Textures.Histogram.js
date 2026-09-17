const
    exe = op.inTrigger("Trigger"),
    inTex = op.inTexture("Texture"),
    outTex = op.outTexture("Histogram Texture"),
    outTexData = op.outTexture("Histogram Data");

const cgl = op.patch.cgl;
let meshPoints = null;

let fb = null;
let effect = null;

let shaderWave = new CGL.Shader(cgl, "imgcompose bg");
shaderWave.setSource(shaderWave.getDefaultVertexShader(), attachments.histogram_wave_frag);
shaderWave.textureUniform = new CGL.Uniform(shaderWave, "t", "tex", 0);

let shaderPointsR = new CGL.Shader(cgl, "histogram r");
shaderPointsR.setSource(attachments.histogram_vert, attachments.histogram_frag);
shaderPointsR.textureUniform = new CGL.Uniform(shaderPointsR, "t", "tex", 0);
shaderPointsR.define("HISTOGRAM_R");

let shaderPointsG = new CGL.Shader(cgl, "histogram g");
shaderPointsG.setSource(attachments.histogram_vert, attachments.histogram_frag);
shaderPointsG.textureUniform = new CGL.Uniform(shaderPointsG, "t", "tex", 0);
shaderPointsG.define("HISTOGRAM_G");

let shaderPointsB = new CGL.Shader(cgl, "histogram b");
shaderPointsB.setSource(attachments.histogram_vert, attachments.histogram_frag);
shaderPointsB.textureUniform = new CGL.Uniform(shaderPointsB, "t", "tex", 0);
shaderPointsB.define("HISTOGRAM_B");

let shaderPointsLumi = new CGL.Shader(cgl, "histogram lumi");
shaderPointsLumi.setSource(attachments.histogram_vert, attachments.histogram_frag);
shaderPointsLumi.textureUniform = new CGL.Uniform(shaderPointsLumi, "t", "tex", 0);
shaderPointsLumi.define("HISTOGRAM_LUMI");

let prevViewPort = [0, 0, 0, 0];

function initEffect()
{
    if (!fb) fb = new CGL.Framebuffer2(cgl, 256, 4,
        {
            "pixelFormat": CGL.Texture.PFORMATSTR_RGBA32F,
            "multisampling": false,
            "depth": true,
            "multisamplingSamples": 0,
            "clear": true,
            "filter": CGL.Texture.FILTER_NEAREST,
            "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE
        });

    if (effect) effect.delete();
    effect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": false });

    let tex = new CGL.Texture(cgl,
        {
            "isFloatingPointTexture": false,
            "filter": CGL.Texture.FILTER_LINEAR,
            "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
            "width": 256,
            "height": 256
        });

    effect.setSourceTexture(tex);
    outTex.setRef(null);
}

function setUpPointVerts()
{
    // gl.POINTS is not reliably rasterized on all gpu/driver combinations, so instead
    // of one GL_POINTS vertex per source pixel, instance a tiny quad per source pixel
    // (one quad = one bin/value scatter marker) using GL_TRIANGLES.
    const geom = new CGL.Geometry(op.name);
    geom.vertices = [
        -1, -1, 0,
        1, -1, 0,
        1, 1, 0,
        -1, 1, 0
    ];
    geom.verticesIndices = [0, 1, 2, 0, 2, 3];

    meshPoints = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.TRIANGLES });
    meshPoints.setGeom(geom);

    let res = 256;
    let instTexCoords = new Float32Array(res * res * 2);
    let i = 0;
    for (let x = 0; x < res; x++)
    {
        for (let y = 0; y < res; y++)
        {
            instTexCoords[i * 2] = x / res;
            instTexCoords[i * 2 + 1] = y / res;
            i++;
        }
    }

    meshPoints.addAttribute("instTexCoord", instTexCoords, 2, { "instanced": true });
    meshPoints.setNumInstances(res * res);
}

exe.onTriggered = function ()
{
    if (!fb)
    {
        setUpPointVerts();
        initEffect();
    }
    if (meshPoints && inTex.get())
    {
        cgl.pushBlendMode(CGL.BLEND_NORMAL, false);
        cgl.pushBlend(true);

        let vp = cgl.getViewPort();
        prevViewPort[0] = vp[0];
        prevViewPort[1] = vp[1];
        prevViewPort[2] = vp[2];
        prevViewPort[3] = vp[3];

        // setup data
        fb.renderStart(cgl);

        cgl.gl.clearColor(0, 0, 0, 1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);

        cgl.setViewPort(0, 0, 256, 4);

        cgl.pushDepthTest(false);

        cgl.setTexture(0, inTex.get().tex);

        meshPoints.render(shaderPointsR);
        meshPoints.render(shaderPointsG);
        meshPoints.render(shaderPointsB);
        meshPoints.render(shaderPointsLumi);

        cgl.popDepthTest();

        fb.renderEnd(cgl);

        // render wave

        cgl.currentTextureEffect = effect;

        effect.startEffect();

        cgl.pushShader(shaderWave);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, fb.getTextureColor().tex);
        cgl.currentTextureEffect.finish();
        cgl.popShader();

        effect.endEffect();

        cgl.setViewPort(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

        cgl.popBlend();
        cgl.popBlendMode();

        cgl.currentTextureEffect = null;

        outTex.setRef(effect.getCurrentSourceTexture());
        outTexData.setRef(fb.getTextureColor());

    }
};
