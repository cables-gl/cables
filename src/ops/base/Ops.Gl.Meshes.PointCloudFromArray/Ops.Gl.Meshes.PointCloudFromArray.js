const
    exe = op.inTrigger("exe"),
    arr = op.inArray("Array", 3),
    numPoints = op.inValueInt("Num Points"),
    outTrigger = op.outTrigger("Trigger out"),
    outGeom = op.outObject("Geometry"),
    pTexCoordRand = op.inValueBool("Scramble Texcoords", true),
    seed = op.inValue("Seed", 1),
    inCoords = op.inArray("Coordinates", 2),
    vertCols = op.inArray("Vertex Colors", 4);

op.toWorkPortsNeedToBeLinked(arr, exe);
op.setPortGroup("Texture Coordinates", [pTexCoordRand, seed, inCoords]);

const cgl = op.patch.cgl;
const geom = new CGL.Geometry("pointcloudfromarray");
let deactivated = false;
let mesh = null;
let texCoords = [];
let needsRebuild = true;
let showingError = false;

arr.setUiAttribs({ "title": "Positions" });
inCoords.setUiAttribs({ "title": "Texture Coordinates" });

inCoords.onChange =
    pTexCoordRand.onChange = updateTexCoordsPorts;
vertCols.onChange = updateVertCols;
numPoints.onChange = updateNumVerts;
seed.onChange =
    arr.onChange;
vertCols.onLinkChanged = reset;
exe.onTriggered = doRender;

function doRender()
{
    outTrigger.trigger();
    if (CABLES.UI)
    {
        let shader = cgl.getShader();
        if (shader.glPrimitive != cgl.gl.POINTS) op.setUiError("nopointmat", "Using a Material not made for point rendering. Try to use PointMaterial.");
        else op.setUiError("nopointmat", null);
    }

    if (needsRebuild || !mesh) rebuild();
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

    mesh = null;
    needsRebuild = true;
}

function updateVertCols()
{
    if (!vertCols.get()) return;
    if (!geom.vertexColors) reset();

    if (mesh)mesh.setAttribute(CGL.SHADERVAR_VERTEX_COLOR, vertCols.get(), 4);
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

    if (verts.length % 3 !== 0)
    {
        // if (!showingError)
        // {
        op.setUiError("div3", "Array length not multiple of 3");

        // op.uiAttr({ "error": "Array length not divisible by 3!" });
        // showingError = true;
        // }
        return;
    }
    else op.setUiError("div3", null);

    if (geom.vertices.length == verts.length && mesh && !inCoords.isLinked() && !vertCols.isLinked())
    {
        mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, verts, 3);
        geom.vertices = verts;
        needsRebuild = false;

        return;
    }

    geom.clear();
    let num = verts.length / 3;
    num = Math.abs(Math.floor(num));

    if (num == 0) return;

    if (!texCoords || texCoords.length != num * 2) texCoords = new Float32Array(num * 2); // num*2;//=

    let changed = true;
    let rndTc = pTexCoordRand.get();

    if (!inCoords.isLinked())
    {
        Math.randomSeed = seed.get();
        texCoords = []; // needed otherwise its using the reference to input incoords port
        // let genCoords = !inCoords.isLinked();

        for (let i = 0; i < num; i++)
        {
            if (geom.vertices[i * 3] != verts[i * 3] ||
                geom.vertices[i * 3 + 1] != verts[i * 3 + 1] ||
                geom.vertices[i * 3 + 2] != verts[i * 3 + 2])
            {
                // if (genCoords)
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
            }
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
        if (inCoords.isLinked()) texCoords = inCoords.get();

        geom.setPointVertices(verts);
        geom.setTexCoords(texCoords);
        // geom.verticesIndices = [];

        if (mesh)mesh.dispose();
        mesh = new CGL.Mesh(cgl, geom, cgl.gl.POINTS);

        mesh.addVertexNumbers = true;
        mesh.setGeom(geom);

        outGeom.set(null);
        outGeom.set(geom);
    }

    updateNumVerts();
    needsRebuild = false;
}
