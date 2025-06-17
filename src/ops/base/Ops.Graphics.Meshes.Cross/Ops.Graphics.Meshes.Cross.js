const
    render = op.inTrigger("Render"),
    size = op.inValue("Size", 1),
    thick = op.inValue("Thickness", 0.25),
    target = op.inValueBool("Crosshair"),

    showLeft = op.inValueBool("Left", true),
    showRight = op.inValueBool("Right", true),
    showTop = op.inValueBool("Top", true),
    showBottom = op.inValueBool("Bottom", true),

    active = op.inValueBool("Active", true),

    trigger = op.outTrigger("Next"),
    geomOut = op.outObject("Geometry");

const cgl = op.patch.cgl;
let geom = null;
let mesh = null;

showLeft.onChange =
    showRight.onChange =
    showTop.onChange =
    showBottom.onChange =
    size.onChange =
    thick.onChange =
    target.onChange = buildMeshLater;

render.onTriggered = function ()
{
    if (!mesh)buildMesh();
    if (active.get() && mesh) mesh.render();
    trigger.trigger();
};

function buildMesh()
{
    if (!geom)geom = new CGL.Geometry("crossmesh");
    geom.clear();

    let ext = size.get() / 2.0;
    let thi = thick.get();

    if (thi < 0.0)
    {
        thi = 0.0;
    }
    else if (thi > ext)
    {
        thi = ext;
    }

    if (ext < 0.0)
    {
        ext = 0.0;
        thi = 0.0;
    }

    // center verts
    let cx = thi;
    let cy = thi;

    // o is outer verts from center
    let ox = ext;
    let oy = ext;

    geom.vertices = [
        // center piece
        -cx, -cy, 0, // 0
        -cx, cy, 0, // 1
        cx, cy, 0, // 2
        cx, -cy, 0, // 3

        // left piece
        -ox, -cy, 0, // 4
        -ox, cy, 0, // 5
        -cx, cy, 0, // 6
        -cx, -cy, 0, // 7

        // right piece
        cx, -cy, 0, // 8
        cx, cy, 0, // 9
        ox, cy, 0, // 10
        ox, -cy, 0, // 11

        // top piece
        -cx, cy, 0, // 12
        -cx, oy, 0, // 13
        cx, oy, 0, // 14
        cx, cy, 0, // 15

        // bottom piece
        -cx, -oy, 0, // 12
        -cx, -cy, 0, // 13
        cx, -cy, 0, // 14
        cx, -oy, 0 // 15
    ];

    let texCoords = [];
    texCoords.length = (geom.vertices.length / 3.0) * 2.0;

    for (let i = 0; i < geom.vertices.length; i += 3)
    {
        let vx = (geom.vertices[i] / (ox) + 1) / 2;
        let vy = (geom.vertices[i + 1] / (oy) + 1) / 2;
        let index = (i / 3.0) * 2.0;

        texCoords[index] = vx;
        texCoords[index + 1] = vy;
    }

    geom.setTexCoords(texCoords);
    geom.tangents = geom.vertices.map(function (v, i) { return i % 3 == 0 ? 1 : 0; });
    geom.biTangents = geom.vertices.map(function (v, i) { return i % 3 == 1 ? 1 : 0; });
    geom.vertexNormals = geom.vertices.map(function (v, i) { return i % 3 == 2 ? 1 : 0; });

    geom.vertexNormals = [
        // center piece
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // left
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        // right
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        // top
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        // bottom
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];

    if (target.get() == true)
    {
        // draws a crosshair
        geom.verticesIndices = [];
        // left
        if (showLeft.get())geom.verticesIndices.push(4, 5, 6, 4, 6, 7);
        // right
        if (showRight.get())geom.verticesIndices.push(8, 9, 10, 8, 10, 11);
        // top
        if (showTop.get())geom.verticesIndices.push(12, 13, 14, 12, 14, 15);
        // bottom
        if (showBottom.get())geom.verticesIndices.push(16, 17, 18, 16, 18, 19);
    }
    else
    {
        // draws a solid cross
        geom.verticesIndices = [
            // center
            2, 1, 0, 3, 2, 0];
        // left
        if (showLeft.get())geom.verticesIndices.push(6, 5, 4, 7, 6, 4);
        // right
        if (showRight.get())geom.verticesIndices.push(10, 9, 8, 11, 10, 8);
        // top
        if (showTop.get())geom.verticesIndices.push(14, 13, 12, 15, 14, 12);
        // bottom
        if (showBottom.get())geom.verticesIndices.push(18, 17, 16, 19, 18, 16);
    }

    if (geom.verticesIndices.length === 0)geom.verticesIndices.push(0, 0, 0);

    // mesh = new CGL.Mesh(cgl, geom);
    mesh = op.patch.cg.createMesh(geom, { "opId": op.id });

    geomOut.setRef(geom);
}

function buildMeshLater()
{
    if (mesh)mesh.dispose();
    mesh = null;
}
