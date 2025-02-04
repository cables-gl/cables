const
    render = op.inTrigger("render"),
    inNum = op.inInt("Num Points", 0),
    inAxis = op.inSwitch("Axis", ["XYZ", "XY"], "XYZ"),
    inTex = op.inTexture("Texture", null, "texture"),
    inTexPS = op.inTexture("Point Size", null, "texture"),
    inNorm = op.inBool("Normalize", false),
    inRemove0 = op.inBool("Remove Point at 0", false),
    inIgnoreAlpha0 = op.inBool("Ignore Alpha 0", true),
    trigger = op.outTrigger("Trigger"),
    outNumPoints = op.outNumber("Total Points", 0);

const cgl = op.patch.cgl;
let mesh = null;
let numVerts = 0;
let currentNum = 0;

op.toWorkPortsNeedToBeLinked(render, inTex);

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": -10,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "",
    "srcBodyVert": attachments.vertposbody_vert
});

mod.addUniformVert("t", "MOD_tex");
mod.addUniformVert("t", "MOD_texPointSize");
render.onTriggered = doRender;
updateDefines();
mod.addUniformVert("f", "MOD_texSize", 0);
op.onDelete = function () { if (mesh)mesh.dispose(); };

inNorm.onChange =
    inTexPS.onChange =
    inRemove0.onChange =
    inIgnoreAlpha0.onChange =
    inAxis.onChange = updateDefines;

let needsMeshSetup = true;

inTex.onChange = () => { if (inTex.get() != CGL.Texture.getEmptyTexture(cgl))needsMeshSetup = true; };
inNum.onChange = () => { needsMeshSetup = true; };
updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_REMOVEZERO", inRemove0);
    mod.toggleDefine("MOD_AXIS_XY", inAxis.get() == "XY");
    mod.toggleDefine("MOD_AXIS_XYZ", inAxis.get() == "XYZ");
    mod.toggleDefine("MOD_NORMALIZE", inNorm.get());
    mod.toggleDefine("MOD_HAS_PS_TEX", inTexPS.get());
    mod.toggleDefine("MOD_IGNOREALPHA0", inIgnoreAlpha0.get());
}

function doRender()
{
    if (inTex.get() == CGL.Texture.getEmptyTexture(cgl))
    {
        trigger.trigger();

        return;
    }

    if (needsMeshSetup)setupMesh();
    if (!inTex.get() || !inTex.get().tex) return;
    mod.bind();
    if (inTex.get())mod.pushTexture("MOD_tex", inTex.get().tex);
    if (inTexPS.get())mod.pushTexture("MOD_texPointSize", inTexPS.get().tex);

    mod.setUniformValue("MOD_texSize", inTex.get().width + 1);

    if (numVerts > 0 && inNum.get() >= 0 && mesh)
    {
        if (inNum.get() > 0)mesh.setNumVertices(Math.min(numVerts, inNum.get()));
        else mesh.setNumVertices(numVerts);

        mesh.render(cgl.getShader());
    }

    mod.unbind();
    trigger.trigger();
}

function setupMesh()
{
    if (!inTex.get())
    {
        outNumPoints.set(0);
        return;
    }
    const num = (inTex.get().width) * (inTex.get().height);
    outNumPoints.set(num);

    if (num == currentNum) return;
    currentNum = num;

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

    if (mesh)mesh.dispose();

    if (numVerts > 0) mesh = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.POINTS });

    if (!mesh) return;
    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);
    needsMeshSetup = false;
}
