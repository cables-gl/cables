const
    exe = op.inTrigger("Trigger"),
    inTex = op.inTexture("Texture"),
    outTex = op.outTexture("Histogram Texture"),
    outTexData = op.outTexture("Histogram Data");

const cgl = op.patch.cgl;
let meshPoints = null;
let fb = new CGL.Framebuffer2(cgl, 256, 8, { "isFloatingPointTexture": true,
    "filter": CGL.Texture.FILTER_NEAREST,
    "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE });

// fb.setFilter(CGL.Texture.FILTER_NEAREST);
let effect = null;

function initEffect()
{
    if (effect)effect.delete();
    effect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": false });

    let tex = new CGL.Texture(cgl,
        {
            "isFloatingPointTexture": false,
            "filter": CGL.Texture.FILTER_NEAREST,
            "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
            "width": 256,
            "height": 256,
        });

    effect.setSourceTexture(tex);
    outTex.set(null);
}

function setUpPointVerts()
{
    const geom = new CGL.Geometry(op.name);
    let res = 256;
    let verts = [];
    let texCoords = [];
    let i = 0;
    verts.length = res * res * 3;
    texCoords.length = res * res * 2;
    for (let x = 0; x < res; x++)
    {
        for (let y = 0; y < res; y++)
        {
            i++;
            verts[i * 3 + 2] = verts[i * 3 + 1] = verts[i * 3 + 0] = 0;
            texCoords[i * 2] = x / res;
            texCoords[i * 2 + 1] = y / res;
        }
    }
    geom.setPointVertices(verts);
    geom.texCoords = texCoords;

    meshPoints = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.POINTS });
    meshPoints.setGeom(geom);
}

let shaderWave = new CGL.Shader(cgl, "imgcompose bg");
shaderWave.setSource(shaderWave.getDefaultVertexShader(), attachments.histogram_wave_frag);
shaderWave.textureUniform = new CGL.Uniform(shaderWave, "t", "tex", 2);

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

setUpPointVerts();
initEffect();
let prevViewPort = [0, 0, 0, 0];

exe.onTriggered = function ()
{
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

        cgl.setTexture(0, inTex.get().tex);
        meshPoints.render(shaderPointsR);
        meshPoints.render(shaderPointsG);
        meshPoints.render(shaderPointsB);
        meshPoints.render(shaderPointsLumi);

        fb.renderEnd(cgl);
        outTexData.set(fb.getTextureColor());

        // render wave

        cgl.currentTextureEffect = effect;

        effect.startEffect();

        cgl.pushShader(shaderWave);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(2, fb.getTextureColor().tex);
        cgl.currentTextureEffect.finish();
        cgl.popShader();

        outTex.set(effect.getCurrentSourceTexture());

        effect.endEffect();

        cgl.setViewPort(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

        cgl.popBlend();
        cgl.popBlendMode();

        cgl.currentTextureEffect = null;
    }
};
