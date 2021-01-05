const
    exe = op.inTrigger("exe"),
    arr = op.inArray("Array"),
    numPoints = op.inValueInt("Num Points"),
    outTrigger = op.outTrigger("Trigger out"),
    outGeom = op.outObject("Geometry"),
    pTexCoordRand = op.inValueBool("Scramble Texcoords", true),
    seed = op.inValue("Seed"),
    inCoords = op.inArray("Coordinates"),
    vertCols = op.inArray("Vertex Colors");

const cgl = op.patch.cgl;

inCoords.onChange = updateTexCoordsPorts;
pTexCoordRand.onChange = updateTexCoordsPorts;

vertCols.onChange = seed.onChange = arr.onChange = reset;
numPoints.onChange = updateNumVerts;

op.toWorkPortsNeedToBeLinked(arr, exe);

op.setPortGroup("Texture Coordinates", [pTexCoordRand, seed, inCoords]);

let deactivated = false;
let showingError = false;

exe.onTriggered = doRender;

let mesh = null;
const geom = new CGL.Geometry("pointcloudfromarray");
let texCoords = [];
let needsRebuild = true;

function doRender()
{
    outTrigger.trigger();
    if (CABLES.UI)
    {
        let shader = cgl.getShader();
        if (shader.glPrimitive != cgl.gl.POINTS) op.setUiError("nopointmat", "Using a Material not made for point rendering. Try to use PointMaterial.");
        else op.setUiError("nopointmat", null);
    }

    if (needsRebuild || !mesh)rebuild();
    if (!deactivated && mesh) mesh.render(cgl.getShader());
}

function reset()
{
    deactivated = arr.get() == null;

    if (!deactivated)needsRebuild = true;
    else needsRebuild = false;
}

function updateTexCoordsPorts()
{
    if (inCoords.isLinked())
    {
        seed.setUiAttribs({ "greyout": true });
        pTexCoordRand.setUiAttribs({ "greyout": true });
    }
    else
    {
        pTexCoordRand.setUiAttribs({ "greyout": false });

        if (!pTexCoordRand.get()) seed.setUiAttribs({ "greyout": true });
        else seed.setUiAttribs({ "greyout": false });
    }

    needsRebuild = true;
}

function updateNumVerts()
{
    if (mesh)
    {
        mesh.setNumVertices(Math.min(geom.vertices.length / 3, numPoints.get()));
        if (numPoints.get() == 0)mesh.setNumVertices(geom.vertices.length / 3);
    }
}

function rebuild()
{
    let verts = arr.get();

    if (!verts || verts.length == 0)
    {
        // mesh=null;
        return;
    }

    if (geom.vertices.length == verts.length && mesh && !showingError && !inCoords.isLinked() && !vertCols.isLinked())
    {
        mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, verts, 3);
        geom.vertices = verts;
        needsRebuild = false;
        return;
    }

    if (showingError)
    {
        showingError = false;
        op.uiAttr({ "error": null });
    }

    let divisibleBy3 = verts.length % 3 === 0;

    if (divisibleBy3 === false)
    {
        if (!showingError)
        {
            op.uiAttr({ "error": "Array length not divisible by 3!" });
            showingError = true;
        }
        return;
    }

    geom.clear();
    let num = verts.length / 3;
    num = Math.abs(Math.floor(num));

    if (num == 0) return;

    if (!texCoords || texCoords.length != num * 2) texCoords = new Float32Array(num * 2); // num*2;//=

    let changed = false;
    let rndTc = pTexCoordRand.get();

    Math.randomSeed = seed.get();
    let genCoords = !inCoords.isLinked();
    changed = !inCoords.isLinked();

    for (let i = 0; i < num; i++)
    {
        if (geom.vertices[i * 3] != verts[i * 3] ||
            geom.vertices[i * 3 + 1] != verts[i * 3 + 1] ||
            geom.vertices[i * 3 + 2] != verts[i * 3 + 2])
        {
            if (genCoords)
                if (rndTc)
                {
                    texCoords[i * 2] = Math.seededRandom();
                    texCoords[i * 2 + 1] = Math.seededRandom();
                }
                else
                {
                    texCoords[i * 2] = i / num;
                    texCoords[i * 2 + 1] = i / num;
                }
            changed = true;
        }
    }

    if (vertCols.get())
    {
        if (!showingError && vertCols.get().length != num * 4)
        {
            op.uiAttr({ "error": "Color array does not have the correct length! (should be " + num * 4 + ")" });
            showingError = true;
            mesh = null;
            return;
        }

        geom.vertexColors = vertCols.get();
    }
    else geom.vertexColors = [];

    if (changed)
    {
        if (!genCoords) texCoords = inCoords.get();

        geom.setPointVertices(verts);
        geom.setTexCoords(texCoords);
        geom.verticesIndices = [];

        if (mesh)mesh.dispose();
        mesh = new CGL.Mesh(cgl, geom, cgl.gl.POINTS);

        mesh.addVertexNumbers = true;
        mesh.setGeom(geom);
        outGeom.set(geom);
    }

    updateNumVerts();
    needsRebuild = false;
}
