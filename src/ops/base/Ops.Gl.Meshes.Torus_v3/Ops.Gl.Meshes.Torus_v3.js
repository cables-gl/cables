const
    render = op.inTrigger("render"),
    sides = op.inValue("sides", 32),
    rings = op.inValue("rings", 32),
    innerRadius = op.inValue("innerRadius", 0.25),
    outerRadius = op.inValue("outerRadius", 0.5),
    indraw = op.inBool("Draw", true),
    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("geometry");

indraw.setUiAttribs({ "title": "Render mesh" });

const UP = vec3.fromValues(0, 1, 0), RIGHT = vec3.fromValues(1, 0, 0);
let tmpNormal = vec3.create(), tmpVec = vec3.create();

geomOut.ignoreValueSerialize = true;

let cgl = op.patch.cg || op.patch.cgl;
let mesh = null;
let geom = null;
let j = 0, i = 0, idx = 0;
let needsUpdate = true;
op.onDelete = function () { if (mesh)mesh.dispose(); };

rings.onChange =
sides.onChange =
innerRadius.onChange =
outerRadius.onChange = function ()
{
    needsUpdate = true;
};

render.onTriggered = function ()
{
    if (needsUpdate) updateMesh();
    if (indraw.get() && mesh !== null) mesh.render();

    trigger.trigger();
};

function updateMesh()
{
    let nrings = Math.round(rings.get()) + 1;
    let nsides = Math.round(sides.get()) + 1;
    if (nrings < 3)nrings = 3;
    if (nsides < 3)nsides = 3;
    let r = innerRadius.get();
    let r2 = outerRadius.get();
    generateTorus(r, r2, nrings, nsides);
    needsUpdate = false;
}

function circleTable(n, flip)
{
    let i;

    /* Table size, the sign of n flips the circle direction */
    let size = Math.abs(n);

    /* Determine the angle between samples */
    let angle = 2 * Math.PI / (n - 1);
    if (flip) angle = -angle;

    /* Allocate memory for n samples, plus duplicate of first entry at the end */
    let sint = [];
    let cost = [];

    sint[0] = 0;
    cost[0] = 1;

    /* Compute cos and sin around the circle */
    for (i = 1; i < size - 1; i++)
    {
        sint[i] = Math.sin(angle * i);
        cost[i] = Math.cos(angle * i);
    }

    sint[size - 1] = 0;
    cost[size - 1] = 1;

    return { "cost": cost, "sint": sint };
}

function generateTorus(iradius, oradius, nRings, nSides)
{
    let table1 = circleTable(nRings, false);
    let table2 = circleTable(nSides, true);
    let t;

    geom = new CGL.Geometry("torus");
    let tangents = [];
    let biTangents = [];
    let vertexNormals = [];
    let tc = [];

    for (j = 0; j < nRings; j++)
    {
        for (i = 0; i < nSides; i++)
        {
            let offset = 3 * (j * nSides + i);
            let offset2 = 2 * (j * nSides + i);

            geom.vertices[offset] = table1.cost[j] * (oradius + table2.cost[i] * iradius);
            geom.vertices[offset + 1] = table1.sint[j] * (oradius + table2.cost[i] * iradius);
            geom.vertices[offset + 2] = table2.sint[i] * iradius;

            vertexNormals[offset] = tmpNormal[0] = table1.cost[j] * table2.cost[i];
            vertexNormals[offset + 1] = tmpNormal[1] = table1.sint[j] * table2.cost[i];
            vertexNormals[offset + 2] = tmpNormal[2] = table2.sint[i];

            if (Math.abs(tmpNormal[1]) == 1) t = RIGHT;
            else t = UP;

            vec3.cross(tmpVec, tmpNormal, t);
            vec3.normalize(tmpVec, tmpVec);
            tangents[offset] = tmpVec[0];
            tangents[offset + 1] = tmpVec[1];
            tangents[offset + 2] = tmpVec[2];
            vec3.cross(tmpVec, tmpVec, tmpNormal);
            biTangents[offset] = tmpVec[0];
            biTangents[offset + 1] = tmpVec[1];
            biTangents[offset + 2] = tmpVec[2];

            tc[offset2] = j / (nRings - 1);
            tc[offset2 + 1] = i / (nSides - 1);
        }
    }

    for (j = 0, idx = 0; j < nRings - 1; j++)
    {
        for (i = 0; i < nSides - 1; i++)
        {
            let offset = j * nSides + i;
            geom.verticesIndices[idx++] = offset;
            geom.verticesIndices[idx++] = offset + 1;
            geom.verticesIndices[idx++] = offset + nSides;

            geom.verticesIndices[idx++] = offset + 1;
            geom.verticesIndices[idx++] = offset + nSides + 1;
            geom.verticesIndices[idx++] = offset + nSides;
        }
    }

    if (geom.biTangents.length == biTangents.length)geom.biTangents.set(biTangents);
    else geom.biTangents = new Float32Array(biTangents);

    if (geom.tangents.length == tangents.length)geom.tangents.set(tangents);
    else geom.tangents = new Float32Array(tangents);

    if (geom.vertexNormals.length == vertexNormals.length)geom.vertexNormals.set(vertexNormals);
    else geom.vertexNormals = new Float32Array(vertexNormals);

    geom.setTexCoords(tc);

    geomOut.setRef(geom);

    if (!mesh) mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
    // if (!mesh)mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);
}
