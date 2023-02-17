const
    render = op.inTrigger("render"),
    inTex = op.inTexture("Texture", null, "texture"),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
let mesh = null;
let numVerts = 0;

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "priority": 0,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "",
    "srcBodyVert": attachments.splinetex_vert
});

mod.addUniformVert("t", "MOD_tex");
mod.addUniformVert("t", "MOD_texPointSize");

render.onTriggered = doRender;
updateDefines();

mod.addUniformVert("f", "MOD_texSize", 0);

// inAxis.onChange = updateDefines;

inTex.onChange = setupMesh;
setupMesh();
updateDefines();

function updateDefines()
{
}

function doRender()
{
    mod.bind();
    if (!inTex.get() || !inTex.get().tex) return;
    if (inTex.get())mod.pushTexture("MOD_tex", inTex.get().tex);

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
