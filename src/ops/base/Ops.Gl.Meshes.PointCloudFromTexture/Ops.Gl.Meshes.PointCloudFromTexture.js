const
    render = op.inTrigger("render"),
    inNum = op.inInt("Num Points", 10000),
    inTex = op.inTexture("Texture", null, "texture"),
    // inMode = op.inSwitch("Mode", ["Absolute", "Add"], "Absolute"),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
// let inTexUniform = null;
let mesh = null;
let numVerts = 0;

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "priority": 2,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "",
    "srcBodyVert": attachments.vertposbody_vert
});

mod.addUniformVert("t", "MOD_tex");
// inMode.onChange = updateDefines;
render.onTriggered = doRender;
updateDefines();

mod.addUniformVert("f", "MOD_texSize", 0);

inNum.onChange = setupMesh;
setupMesh();

function updateDefines()
{
    // mod.toggleDefine("MOD_ADD", inMode.get() == "Add");
    // mod.toggleDefine("MOD_ABS", inMode.get() == "Absolute");
}

function doRender()
{
    mod.bind();
    if (!inTex.get() || !inTex.get().tex) return;
    if (inTex.get())mod.pushTexture("MOD_tex", inTex.get().tex);

    mod.setUniformValue("MOD_texSize", inTex.get().width);

    if (numVerts > 0 && inNum.get() > 0 && mesh)mesh.render(cgl.getShader());

    trigger.trigger();
    mod.unbind();
}

function setupMesh()
{
    const num = Math.max(0, Math.floor(inNum.get()));

    let verts = new Float32Array(num * 3);
    let texCoords = new Float32Array(num * 2);

    const geom = new CGL.Geometry("pointcloudfromTexture");
    geom.setPointVertices(verts);
    geom.setTexCoords(texCoords);
    geom.verticesIndices = [];
    numVerts = verts.length / 3;

    if (mesh)mesh.dispose();

    if (numVerts > 0)
        mesh = new CGL.Mesh(cgl, geom, cgl.gl.POINTS);

    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);
}
