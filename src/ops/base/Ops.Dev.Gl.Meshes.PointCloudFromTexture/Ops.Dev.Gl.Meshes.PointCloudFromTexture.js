const
    render = op.inTrigger("render"),
    inNum = op.inInt("Num Points", 0),
    inAxis = op.inSwitch("Axis", ["XYZ", "XY"], "XYZ"),
    inTex = op.inTexture("Texture", null, "texture"),
    inTexPS = op.inTexture("Point Size", null, "texture"),
    inNorm = op.inBool("Normalize", false),
    // inMode = op.inSwitch("Mode", ["Absolute", "Add"], "Absolute"),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
// let inTexUniform = null;
let mesh = null;
let numVerts = 0;

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "priority": 0,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "",
    "srcBodyVert": attachments.vertposbody_vert
});

mod.addUniformVert("t", "MOD_tex");
mod.addUniformVert("t", "MOD_texPointSize");
// inMode.onChange = updateDefines;
render.onTriggered = doRender;
updateDefines();

mod.addUniformVert("f", "MOD_texSize", 0);

inNorm.onChange =
    inTexPS.onChange =
    inAxis.onChange = updateDefines;

let needsMeshSetup = true;

inTex.onChange =
inNum.onChange = () => { needsMeshSetup = true; };
updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_AXIS_XY", inAxis.get() == "XY");
    mod.toggleDefine("MOD_AXIS_XYZ", inAxis.get() == "XYZ");
    mod.toggleDefine("MOD_NORMALIZE", inNorm.get());
    mod.toggleDefine("MOD_HAS_PS_TEX", inTexPS.get());
}

function doRender()
{
    if (needsMeshSetup)setupMesh();
    mod.bind();
    if (!inTex.get() || !inTex.get().tex) return;
    if (inTex.get())mod.pushTexture("MOD_tex", inTex.get().tex);
    if (inTexPS.get())mod.pushTexture("MOD_texPointSize", inTexPS.get().tex);

    mod.setUniformValue("MOD_texSize", inTex.get().width + 1);

    if (numVerts > 0 && inNum.get() >= 0 && mesh) mesh.render(cgl.getShader());

    trigger.trigger();
    mod.unbind();
}

function setupMesh()
{
    if (inNum.get() === 0 && !inTex.get()) return;

    const num = inTex.get().width * inTex.get().height;

    let verts = new Float32Array(num * 3);
    let texCoords = new Float32Array(num * 2);

    let bias = 0.5 * (1.0 / inTex.get().width);

    for (let x = 0; x < inTex.get().width; x++)
        for (let y = 0; y < inTex.get().height; y++)
        {
            texCoords[(x + y * inTex.get().width) * 2] = (x / inTex.get().width) + bias;
            texCoords[(x + y * inTex.get().width) * 2 + 1] = (y / inTex.get().height) + bias;
        }

    const geom = new CGL.Geometry("pointcloudfromTexture");
    geom.setPointVertices(verts);
    geom.setTexCoords(texCoords);
    geom.verticesIndices = [];
    numVerts = verts.length / 3;

    console.log("points  numVerts", numVerts);

    if (mesh)mesh.dispose();

    if (numVerts > 0)
        mesh = new CGL.Mesh(cgl, geom, cgl.gl.POINTS);

    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);
    needsMeshSetup = false;
}
