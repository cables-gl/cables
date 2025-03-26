const
    exe = op.inTrigger("exe"),
    arr = op.inArray("Array", 3),
    numPoints = op.inValueInt("Num Points"),
    outTrigger = op.outTrigger("Trigger out"),
    outGeom = op.outObject("Geometry"),
    pTexCoordRand = op.inValueBool("Scramble Texcoords", true),
    seed = op.inValue("Seed", 1),
    inCoords = op.inArray("Coordinates", 2),
    inPointSizes = op.inArray("Point sizes", 1),
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

op.onDelete = disposeMesh;

inCoords.onChange =
    pTexCoordRand.onChange = updateTexCoordsPorts;
vertCols.onChange = updateVertCols;
numPoints.onChange = updateNumVerts;
inPointSizes.onChange = updatePointSizes;

seed.onChange =
    arr.onChange =
    vertCols.onLinkChanged =
    inPointSizes.onLinkChanged = reset;

exe.onTriggered = doRender;

function doRender()
{
    let shader = cgl.getShader();
    op.checkGraphicsApi();

    if (CABLES.UI && shader)
    {
        if (shader.glPrimitive != cgl.gl.POINTS) op.setUiError("nopointmat", "Using a Material not made for point rendering. Try to use PointMaterial.");
        else op.setUiError("nopointmat", null);
    }

    if (needsRebuild || !mesh) rebuild();
    if (!deactivated && mesh) mesh.render(shader);
    outTrigger.trigger();
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

    disposeMesh();
    needsRebuild = true;
}

function updatePointSizes()
{
    if (!inPointSizes.get()) return;

    if (!geom.getAttribute("attrPointSize")) reset();

    if (mesh)mesh.setAttribute("attrPointSize", inPointSizes.get(), 1);
}

function updateVertCols()
{
    needsRebuild = true;
}

function updateNumVerts()
{
    if (mesh)
    {
        mesh.setNumIndices(Math.min(geom.vertices.length / 3, numPoints.get()));
        if (numPoints.get() == 0)mesh.setNumIndices(geom.vertices.length / 3);
    }
}

function disposeMesh()
{
    if (mesh)mesh.dispose();
    mesh = null;
}

function rebuild()
{
    let verts = arr.get() || [];

    if (verts.length % 3 !== 0)
    {
        op.setUiError("div3", "Array length not multiple of 3");

        return;
    }
    else op.setUiError("div3", null);

    if (geom.vertices.length == verts.length && mesh && !inCoords.isLinked() && !vertCols.isLinked() && !geom.getAttribute("attrPointSize"))
    {
        mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, verts, 3);
        geom.vertices = verts;
        needsRebuild = false;

        return;
    }

    // if (geom.getAttribute("attrPointSize" && inPointSizes.isLinked())) changed = true;

    geom.clear();
    let num = verts.length / 3;
    num = Math.abs(Math.floor(num));

    if (num == 0) return;

    if (!texCoords || texCoords.length != num * 2) texCoords = new Float32Array(num * 2); // num*2;//=

    let rndTc = pTexCoordRand.get();

    if (!inCoords.isLinked())
    {
        Math.randomSeed = seed.get();
        texCoords = []; // needed otherwise its using the reference to input incoords port

        for (let i = 0; i < num; i++)
        {
            if (geom.vertices[i * 3] != verts[i * 3] ||
                geom.vertices[i * 3 + 1] != verts[i * 3 + 1] ||
                geom.vertices[i * 3 + 2] != verts[i * 3 + 2])
            {
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
        if (vertCols.get().length != num * 4)
        {
            op.setUiError("vertColWrongLength", "Color array does not have the correct length! (should be " + num * 4 + ")");

            disposeMesh();
            return;
        }
        else op.setUiError("vertColWrongLength", null);

        geom.vertexColors = vertCols.get();
    }
    else
    {
        op.setUiError("vertColWrongLength", null);
        geom.vertexColors = [];
    }

    if (inPointSizes.get())
    {
        if (inPointSizes.get().length != num)
        {
            op.setUiError("pointsizeWrongLength", "Color array does not have the correct length! (should be " + num + ")");
            disposeMesh();
            return;
        }
        else op.setUiError("pointsizeWrongLength", null);

        geom.setAttribute("attrPointSize", inPointSizes.get(), 1);
    }
    else
    {
        op.setUiError("pointsizeWrongLength", null);
        geom.setAttribute("attrPointSize", [], 1);
    }

    if (inCoords.isLinked()) texCoords = inCoords.get();

    geom.setPointVertices(verts);
    geom.setTexCoords(texCoords);

    if (!mesh)mesh = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.POINTS });

    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);

    outGeom.setRef(geom);

    updateNumVerts();
    needsRebuild = false;
}
