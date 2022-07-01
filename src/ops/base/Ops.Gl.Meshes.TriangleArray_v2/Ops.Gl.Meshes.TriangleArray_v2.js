const
    render = op.inTrigger("Render"),
    inArr = op.inArray("Points", 3),
    inVertCols = op.inArray("Vertex Colors", 4),
    inTexCoords = op.inArray("TexCoords", 2),
    inRenderMesh = op.inBool("Render Mesh", true),
    next = op.outTrigger("Next"),
    geomOut = op.outObject("Geometry");

const geom = new CGL.Geometry("triangle array");

let mesh = null;
let verts = null;
const cgl = op.patch.cgl;

op.toWorkPortsNeedToBeLinked(inArr, render);

function update()
{
    op.setUiError("coordsMismatch", null);
    op.setUiError("colorsMismatch", null);

    verts = inArr.get();
    if (!verts) return;

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

    geom.calculateNormals();
    geomOut.set(null);
    geomOut.set(geom);
}

inArr.onChange = update;
inVertCols.onChange = update;
inTexCoords.onChange = update;

render.onTriggered = function ()
{
    if (mesh && verts && inRenderMesh.get()) mesh.render(cgl.getShader());
    next.trigger();
};
