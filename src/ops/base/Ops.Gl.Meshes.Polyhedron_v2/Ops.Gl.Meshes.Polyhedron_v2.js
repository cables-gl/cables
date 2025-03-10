const notation = op.inString("Receipt", "djmeD");
const outGeom = op.outObject("Geometry");

let obj = {};
let faces = [];
let vertices = [];
let vertexColors = [];

notation.onChange = buildMesh;
buildMesh();

function getCellVertices(cellArr)
{
    const verts = [];
    for (let i = 0; i < cellArr.length; i++)
    {
        verts.push(obj.positions[cellArr[i]]);
    }
    return verts;
}

function addFace(verts)
{
    const colR = Math.random();
    const colG = Math.random();
    const colB = Math.random();

    if (verts.length == 3)
    {
        for (let i = 0; i < verts.length; i++)
        {
            vertices.push(verts[i][0], verts[i][1], verts[i][2]);

            let index = vertices.length / 3 - 1;
            faces.push(index);
            vertexColors.push(colR, colG, colB, 1);
        }
    }
    else
    if (verts.length == 4)
    {
        for (let i = 0; i < verts.length; i++)
        {
            vertices.push(verts[i][0], verts[i][1], verts[i][2]);
            vertexColors.push(colR, colG, colB, 1);
        }

        let index = vertices.length / 3 - 4;
        faces.push(index);
        faces.push(index + 1);
        faces.push(index + 2);

        faces.push(index + 2);
        faces.push(index + 3);
        faces.push(index + 0);
    }
    else
    {
        let avgX = 0;
        let avgY = 0;
        let avgZ = 0;

        for (let i = 0; i < verts.length; i++)
        {
            avgX += verts[i][0];
            avgY += verts[i][1];
            avgZ += verts[i][2];
        }
        avgX /= verts.length;
        avgY /= verts.length;
        avgZ /= verts.length;

        vertices.push(avgX, avgY, avgZ);
        vertexColors.push(colR, colG, colB, 1);

        let index = vertices.length / 3 - 1;

        for (let i = 0; i < verts.length; i++)
        {
            vertices.push(verts[i][0], verts[i][1], verts[i][2]);
            vertexColors.push(colR, colG, colB, 1);
        }

        const indexEnd = vertices.length / 3 - 1;

        for (let i = index; i < indexEnd; i++)
        {
            faces.push(index);
            faces.push(i);
            faces.push(i + 1);
        }

        faces.push(index);
        faces.push(indexEnd);
        faces.push(index + 1);
    }
}

function buildMesh()
{
    op.setUiError("mesh", null);

    obj = {};

    faces = [];
    vertices = [];
    vertexColors = [];
    const geom = new CGL.Geometry(op.name);

    try
    {
        obj = conwayhart(String(notation.get()));
    }
    catch (ex)
    {
        op.setUiError("mesh", ex);
        op.logError(ex);
        return;
    }

    for (let i = 0; i < obj.cells.length; i++)
    {
        const verts = getCellVertices(obj.cells[i]);
        addFace(verts, geom);
    }

    geom.vertices = vertices;
    geom.verticesIndices = faces;
    geom.vertexColors = vertexColors;
    geom.calculateNormals();
    geom.calcTangentsBitangents();

    outGeom.setRef(geom);
}
