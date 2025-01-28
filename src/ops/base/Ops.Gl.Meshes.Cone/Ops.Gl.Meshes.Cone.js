// adapted from the FreeGLUT project
const
    render = op.inTrigger("render"),
    slices = op.inValue("slices", 32),
    stacks = op.inValue("stacks", 5),
    radius = op.inValue("radius", 1),
    height = op.inValue("height", 2),
    active = op.inValueBool("Active", true),
    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("geometry");

geomOut.ignoreValueSerialize = true;

const cgl = op.patch.cgl;
let mesh = null;
const geom = null;
let i = 0, j = 0, idx = 0, offset = 0;

let needsRebuild = true;

stacks.onChange = slices.onChange = radius.onChange = height.onChange = updateMeshLater;

function updateMeshLater()
{
    needsRebuild = true;
}

render.onTriggered = function ()
{
    if (needsRebuild) updateMesh();
    if (active.get() && mesh)
    {
        mesh.render();
    }
    else
    {
        trigger.trigger();
        return;
    }

    trigger.trigger();
};

function updateMesh()
{
    let nstacks = Math.round(stacks.get());
    let nslices = Math.round(slices.get());
    if (nstacks < 1)nstacks = 1;
    if (nslices < 3)nslices = 3;
    const r = radius.get();
    generateCone(r, Math.max(0.01, height.get()), nstacks, nslices);
    needsRebuild = false;
}

function circleTable(n, halfCircle)
{
    let i;
    /* Table size, the sign of n flips the circle direction */
    const size = Math.abs(n);

    /* Determine the angle between samples */
    const angle = (halfCircle ? 1 : 2) * Math.PI / n;// ( n === 0 ) ? 1 : n ;

    /* Allocate memory for n samples, plus duplicate of first entry at the end */
    const sint = [];
    const cost = [];

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

function generateCone(base, height, stacks, slices)
{
    let r = base;
    let z = 0;
    const geom = new CGL.Geometry(op.name);
    geom.glPrimitive = cgl.gl.TRIANGLE_STRIP;
    geom.tangents = [];
    geom.biTangents = [];
    geom.vertexNormals = [];

    const table = circleTable(-slices + 1, false);

    const zStep = height / ((stacks > 0) ? stacks : 1);
    const rStep = base / ((stacks > 0) ? stacks : 1);

    /* Scaling factors for vertex normals */
    const cosn = (height / Math.sqrt(height * height + base * base));
    const sinn = (base / Math.sqrt(height * height + base * base));
    const texCoords = [];

    /* bottom */
    geom.vertices[0] = 0;
    geom.vertices[1] = 0;
    geom.vertices[2] = z;
    geom.vertexNormals[0] = 0;
    geom.vertexNormals[1] = 0;
    geom.vertexNormals[2] = -1;
    geom.tangents.push(1, 0, 0);
    geom.biTangents.push(0, 1, 0);

    idx = 3; // index carried over through all for loops - allows mesh buildup
    /* other on bottom (get normals right) */

    for (j = 0; j < slices; j++, idx += 3)
    {
        geom.vertices[idx] = table.cost[j] * r;
        geom.vertices[idx + 1] = table.sint[j] * r;
        geom.vertices[idx + 2] = z;
        geom.vertexNormals[idx] = 0;
        geom.vertexNormals[idx + 1] = 0;
        geom.vertexNormals[idx + 2] = -1;
        geom.tangents[idx] = 1;
        geom.tangents[idx + 1] = 0;
        geom.tangents[idx + 2] = 0;
        geom.biTangents[idx] = 0;
        geom.biTangents[idx + 1] = 1;
        geom.biTangents[idx + 2] = 0;
    }

    /* each stack */
    for (i = 0; i < stacks + 1; i++)
    {
        for (j = 0; j < slices; j++, idx += 3)
        {
            // gets texcoords from textured material
            // xyz converts to xy for uv
            texCoords[idx / 3 * 2] = 1 - j / slices;
            texCoords[idx / 3 * 2 + 1] = 1 - i / stacks;

            geom.vertices[idx] = table.cost[j] * r;
            geom.vertices[idx + 1] = table.sint[j] * r;
            geom.vertices[idx + 2] = z;
            geom.vertexNormals[idx] = table.cost[j] * cosn;
            geom.vertexNormals[idx + 1] = table.sint[j] * cosn;
            geom.vertexNormals[idx + 2] = sinn;
            geom.tangents[idx] = -table.sint[j] * cosn;
            geom.tangents[idx + 1] = table.cost[j] * cosn;
            geom.tangents[idx + 2] = sinn;
            geom.biTangents[idx] = table.sint[j] * cosn * sinn - table.cost[j] * cosn * sinn;
            geom.biTangents[idx + 1] = sinn * (-table.sint[j] * cosn) - sinn * table.cost[j] * cosn;
            geom.biTangents[idx + 2] = table.cost[j] * cosn * table.cost[j] * cosn - (-table.sint[j] * cosn) * table.sint[j] * cosn;
        }

        z += zStep;
        r -= rStep;
    }

    /* top stack - bottom section */
    for (j = 0, idx = 0; j < slices; j++, idx += 2)
    {
        // makes the texture cartopol
        texCoords[0] = (geom.vertices[0] / radius.get()) * 0.5 + 0.5;
        texCoords[1] = 1 - (geom.vertices[1] / radius.get()) * 0.5 + 0.5;

        texCoords[j * 2 + 0] = (geom.vertices[(j) * 3] / radius.get()) * 0.5 + 0.5;
        texCoords[j * 2 + 1] = 1 - (geom.vertices[(j) * 3 + 1] / radius.get()) * 0.5 + 0.5;

        geom.verticesIndices[idx] = 0;
        geom.verticesIndices[idx + 1] = j + 1; /* 0 is top vertex, 1 is first for first stack */
    }

    geom.verticesIndices[idx] = 0; /* repeat first slice's idx for closing off shape */
    geom.verticesIndices[idx + 1] = 1;

    texCoords[0] = (geom.vertices[0] / radius.get()) * 0.5 + 0.5;
    texCoords[1] = 1 - (geom.vertices[1] / radius.get()) * 0.5 + 0.5;

    texCoords[j * 2 + 0] = (geom.vertices[(j) * 3] / radius.get()) * 0.5 + 0.5;
    texCoords[j * 2 + 1] = 1 - (geom.vertices[(j) * 3 + 1] / radius.get()) * 0.5 + 0.5;

    idx += 2;

    /* middle stacks: */
    /* Strip indices are relative to first index belonging to strip, NOT relative to first vertex/normal pair in array */
    for (i = 0; i < stacks; i++, idx += 2)
    {
        offset = 1 + (i + 1) * slices; /* triangle_strip indices start at 1 (0 is top vertex), and we advance one stack down as we go along */
        for (j = 0; j < slices; j++, idx += 2)
        {
            geom.verticesIndices[idx] = offset + j;
            geom.verticesIndices[idx + 1] = offset + j + slices;
        }
        geom.verticesIndices[idx] = offset; /* repeat first slice's idx for closing off shape */
        geom.verticesIndices[idx + 1] = offset + slices;
    }

    geom.setTexCoords(texCoords);

    mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
    geomOut.setRef(geom);
}
