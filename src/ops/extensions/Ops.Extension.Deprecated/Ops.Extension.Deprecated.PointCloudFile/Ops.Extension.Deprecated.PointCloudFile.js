const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");
const points = op.inArray("points");
const doCenter = op.inValueBool("center");
const doRender = op.inValueBool("Render", true);

const outPoints = op.outArray("Points");
const outVertColors = op.outArray("Vertex Colors");

const cgl = this.patch.cgl;

points.ignoreValueSerialize = true;

let meshes = [];

doCenter.onChange = create;

let cycle = 0;
render.onTriggered = function ()
{
    if (doRender.get())
    {
        for (let i = 0; i < meshes.length; i++)
            meshes[i].render(cgl.getShader());
    }

    trigger.trigger();
};

function createMesh(arr, start, end)
{
    let geom = new CGL.Geometry();
    geom.verticesIndices = [];

    let i = 0;
    let texCoords = [];
    let verts = [];
    verts.length = (end - start) * 3;

    let vertColors = [];
    vertColors.length = (end - start) * 4;
    texCoords.length = (end - start) * 2;
    geom.verticesIndices.length = end - start;

    for (i = start; i < end; i++)
    {
        let ind = i - start;
        verts[ind * 3 + 0] = arr[i][0];
        verts[ind * 3 + 1] = arr[i][1];
        verts[ind * 3 + 2] = arr[i][2];

        vertColors[ind * 4 + 0] = arr[i][3] / 255;
        vertColors[ind * 4 + 1] = arr[i][4] / 255;
        vertColors[ind * 4 + 2] = arr[i][5] / 255;
        vertColors[ind * 4 + 3] = 1;

        texCoords[ind * 2 + 0] = 5 / (arr[i][1] % 5);
        texCoords[ind * 2 + 1] = 5 / (arr[i][2] % 5);
    }

    for (i = 0; i < verts.length / 3; i++) geom.verticesIndices[i] = i;

    outPoints.set(verts);
    outVertColors.set(vertColors);

    geom.vertices = verts;
    geom.vertexColors = vertColors;
    geom.texCoords = texCoords;
    console.log("geom.verticesIndices", geom.verticesIndices.length);

    let mesh = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.POINTS });

    console.log("mesh generated");

    return mesh;
}

function create()
{
    let arr = points.get();
    if (!arr) return;
    meshes.length = 0;
    let meshMax = 20000000;
    let i = 0;

    if (doCenter.get())
    {
        let avgX = 0;
        let avgY = 0;
        let avgZ = 0;

        for (i = 0; i < arr.length; i++)
        {
            avgX = (avgX + arr[i][0]) / 2;
            avgY = (avgY + arr[i][1]) / 2;
            avgZ = (avgZ + arr[i][2]) / 2;
        }

        for (i = 0; i < arr.length; i++)
        {
            arr[i][0] -= avgX;
            arr[i][1] -= avgY;
            arr[i][2] -= avgZ;
        }
    }

    if (arr)
    {
        let count = 0;
        for (i = 0; i < arr.length; i += meshMax)
        {
            meshes.push(createMesh(arr, i, Math.min(arr.length, i + meshMax)));
        }
    }
}

create();

points.onValueChange(create);
