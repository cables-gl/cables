const
    render = op.inTrigger("render"),
    inTex = op.inTexture("Texture", null, "texture"),
    inTexParticleTiming = op.inTexture("Particle Timing", null, "texture"),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
let mesh = null;
let numVerts = 0;

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "priority": 0,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.splinetex_head_vert,
    "srcBodyVert": attachments.splinetex_vert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.spline_head_frag,
    "srcBodyFrag": attachments.spline_frag
});

mod.addUniformVert("t", "MOD_tex");
mod.addUniformVert("t", "MOD_texPointSize");
mod.addUniformBoth("t", "MOD_particleMask");

mod.addUniformVert("f", "MOD_texSize", 0);

render.onTriggered = doRender;
updateDefines();

inTex.onChange = setupMesh;
setupMesh();
updateDefines();

inTexParticleTiming.onLinkChanged = updateDefines;

function updateDefines()
{
    mod.toggleDefine("MASK_PARTICLES", inTexParticleTiming.isLinked());
}

function doRender()
{
    mod.bind();
    if (!inTex.get() || !inTex.get().tex) return;
    if (inTex.get()) mod.pushTexture("MOD_tex", inTex.get().tex);
    if (inTexParticleTiming.get()) mod.pushTexture("MOD_particleMask", inTexParticleTiming.get().tex);

    mod.setUniformValue("MOD_texSize", inTex.get().width + 1);

    const shader = cgl.getShader();
    shader.glPrimitive = cgl.gl.LINES;

    if (numVerts > 0 && mesh)
    {
        mesh.render(shader);
    }

    trigger.trigger();
    mod.unbind();
}

function setupMesh()
{
    if (!inTex.get()) return;

    if (inTex.get() == CGL.Texture.getEmptyTexture(op.patch.cgl)) return;

    const tw = inTex.get().width;
    const w = (inTex.get().width) * 2;
    const h = (inTex.get().height);

    const num = w * h;

    if (num == numVerts) return;

    let verts = new Float32Array(num * 3);
    let texCoords = new Float32Array(num * 2);

    let biasX = 0.5 * (1.0 / tw);
    let biasY = 0.5 * (1.0 / h);

    for (let x = 0; x < tw; x++)
        for (let y = 0; y < h; y++)
        {
            texCoords[(x + y * tw) * 4] = ((x + 1) / tw) + biasX;
            texCoords[(x + y * tw) * 4 + 1] = (y / h) + biasY;

            texCoords[(x + y * tw) * 4 + 2] = ((x) / tw) + biasX;
            texCoords[(x + y * tw) * 4 + 3] = (y / h) + biasY;
        }

    const geom = new CGL.Geometry("splineFromTexture");
    geom.setPointVertices(verts);
    geom.setTexCoords(texCoords);
    geom.verticesIndices = [];
    numVerts = verts.length / 3;

    if (mesh)mesh.dispose();

    if (numVerts > 0) mesh = new CGL.Mesh(cgl, geom, cgl.gl.LINES);

    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);
}
