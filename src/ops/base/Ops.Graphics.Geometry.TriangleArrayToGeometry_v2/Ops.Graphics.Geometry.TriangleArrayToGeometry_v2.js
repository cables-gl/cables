const
    render = op.inTrigger("Render"),
    inArr = op.inArray("Points", 3),
    inVertCols = op.inArray("Vertex Colors", 4),
    inTexCoords = op.inArray("TexCoords", 2),
    inFlat = op.inValueBool("Flat", false),
    inRenderMesh = op.inBool("Render Mesh", true),
    next = op.outTrigger("Next"),
    geomOut = op.outObject("Geometry");

let geom = new CGL.Geometry("triangle array");

let mesh = null;
let verts = null;
let needsUpdate = true;
const cgl = op.patch.cgl;

op.toWorkPortsNeedToBeLinked(inArr, render);

inArr.onChange =
inVertCols.onChange =
inTexCoords.onChange = () =>
{
    needsUpdate = true;
};
inFlat.onChange = () =>
{
    geom = new CGL.Geometry("triangle array");
    update();
};

function update()
{
    op.setUiError("coordsMismatch", null);
    op.setUiError("colorsMismatch", null);

    verts = inArr.get();
    if (!verts)
    {
        geomOut.set(null);
        return;
    }

    let num = verts.length / 3;
    num = Math.abs(Math.floor(num));

    let tc = [];
    const texCoords = inTexCoords.get();
    if (texCoords)
    {
        if (texCoords.length !== (num * 2))
        {
            op.setUiError("coordsMismatch", "Coords array does not have the correct length! (should be " + num * 2 + ")");
        }
        tc = texCoords;
    }
    else
    {
        for (let i = 0; i < verts.length / 3; i++)
        {
            tc.push(0, 0, 0, 1, 1, 1);
        }
    }

    geom.vertices = verts;
    geom.texCoords = tc;

    mesh = new CGL.Mesh(cgl, geom);

    const vertexColors = inVertCols.get();
    if (vertexColors)
    {
        if (vertexColors.length !== (num * 4))
        {
            op.setUiError("colorsMismatch", "Color array does not have the correct length! (should be " + num * 4 + ")");
            return;
        }
        geom.vertexColors = vertexColors;
    }

    if (!inFlat.get()) index(verts, geom);
    else
    {
        geom.vertices = verts;
    }

    geom.calculateNormals();
    geomOut.set(null);
    geomOut.set(geom);
    needsUpdate = false;
}

render.onTriggered = function ()
{
    if (needsUpdate)update();
    if (mesh && verts && inRenderMesh.get()) mesh.render(cgl.getShader());
    next.trigger();
};

function index(vertsToIndex, geometry)
{
    const num = vertsToIndex.length / 3;
    const arr = [];
    const ind = [];
    let delta = 0.0001;

    for (let i = 0; i < num; i++)
    {
        let found = false;

        for (let j = 0; j < arr.length; j += 3)
        {
            if (
                arr[j] < vertsToIndex[i * 3] + delta &&
                arr[j + 1] < vertsToIndex[i * 3 + 1] + delta &&
                arr[j + 2] < vertsToIndex[i * 3 + 2] + delta &&
                arr[j] > vertsToIndex[i * 3] - delta &&
                arr[j + 1] > vertsToIndex[i * 3 + 1] - delta &&
                arr[j + 2] > vertsToIndex[i * 3 + 2] - delta)
            {
                ind.push(j / 3);
                found = true;
            }
        }

        if (!found)
        {
            arr.push(vertsToIndex[i * 3]);
            arr.push(vertsToIndex[i * 3 + 1]);
            arr.push(vertsToIndex[i * 3 + 2]);
            ind.push(arr.length / 3 - 1);
        }
    }

    geometry.verticesIndices = ind;
    geometry.vertices = arr;
}
