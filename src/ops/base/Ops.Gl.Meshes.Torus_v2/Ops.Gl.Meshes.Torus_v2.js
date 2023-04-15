const
    render = op.inTrigger("render"),
    sides = op.inValue("sides", 32),
    rings = op.inValue("rings", 32),
    innerRadius = op.inValue("innerRadius", 0.5),
    outerRadius = op.inValue("outerRadius", 1),
    indraw = op.inBool("Draw", true),
    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("geometry");

indraw.setUiAttribs({ "title": "Render mesh" });

const UP = vec3.fromValues(0, 1, 0), RIGHT = vec3.fromValues(1, 0, 0);
let tmpNormal = vec3.create(), tmpVec = vec3.create();

geomOut.ignoreValueSerialize = true;

let cgl = op.patch.cgl;
let mesh = null;
let geom = null;
let j = 0, i = 0, idx = 0;
let needsUpdate = true;

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
    if (indraw.get() && mesh !== null) mesh.render(cgl.getShader());

    trigger.trigger();
};

function updateMesh()
{
    let nrings = Math.round(rings.get());
    let nsides = Math.round(sides.get());
    if (nrings < 2)nrings = 2;
    if (nsides < 2)nsides = 2;
    let r = innerRadius.get();
    let r2 = outerRadius.get();
    generateTorus(r, r2, nrings, nsides);
    needsUpdate = false;
}

function circleTable(n, halfCircle)
{
    let i;
    /* Table size, the sign of n flips the circle direction */
    let size = Math.abs(n);

    /* Determine the angle between samples */
    let angle = (halfCircle ? 1 : 2) * Math.PI / n;// ( n === 0 ) ? 1 : n ;

    /* Allocate memory for n samples, plus duplicate of first entry at the end */
    let sint = [];
    let cost = [];

    /* Compute cos and sin around the circle */
    sint[0] = 0.0;
    cost[0] = 1.0;

    for (i = 1; i < size; i++)
    {
        sint[i] = Math.sin(angle * i);
        cost[i] = Math.cos(angle * i);
    }

    if (halfCircle)
    {
        sint[size] = 0.0; /* sin PI */
        cost[size] = -1.0; /* cos PI */
    }
    else
    {
        /* Last sample is duplicate of the first (sin or cos of 2 PI) */
        sint[size] = sint[0];
        cost[size] = cost[0];
    }
    return { "cost": cost, "sint": sint };
}

function generateTorus(iradius, oradius, nRings, nSides)
{
    let table1 = circleTable(nRings, false);
    let table2 = circleTable(-nSides, false);
    let t;

    geom = new CGL.Geometry("torus");
    let tangents = [];
    let biTangents = [];
    let vertexNormals = [];
    let tc = [];

    for (j = 0; j < nRings + 1; j++)
    {
        for (i = 0; i < nSides + 1; i++)
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

    for (i = 0, idx = 0; i < nSides; i++)
    {
        let ioff = 1;

        for (j = 0; j < nRings; j++)
        {
            let offset = j * nSides + i;
            geom.verticesIndices[idx++] = offset;
            geom.verticesIndices[idx++] = offset + 1;
            geom.verticesIndices[idx++] = offset + nSides;

            geom.verticesIndices[idx++] = offset + 0;
            geom.verticesIndices[idx++] = offset + nSides;
            geom.verticesIndices[idx++] = offset + nSides - 1;
        }
    }

    if (geom.biTangents.length == biTangents.length)geom.biTangents.set(biTangents);
    else geom.biTangents = new Float32Array(biTangents);

    if (geom.tangents.length == tangents.length)geom.tangents.set(tangents);
    else geom.tangents = new Float32Array(tangents);

    if (geom.vertexNormals.length == vertexNormals.length)geom.vertexNormals.set(vertexNormals);
    else geom.vertexNormals = new Float32Array(vertexNormals);

    geom.setTexCoords(tc);

    geomOut.set(null);
    geomOut.set(geom);

    if (!mesh)mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);
}
