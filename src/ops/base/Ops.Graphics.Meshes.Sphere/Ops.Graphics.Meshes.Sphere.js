const render = op.inTrigger("render");
const inStacks = op.inValueInt("stacks", 32);
const inSlices = op.inValueInt("slices", 32);
const inRadius = op.inValueFloat("radius");
const inRender = op.inValueBool("Render", true);
const trigger = op.outTrigger("trigger");
const geomOut = op.outObject("geometry");

inRadius.set(1);
geomOut.ignoreValueSerialize = true;

const cgl = op.patch.cgl;
let mesh = null;
let geom = null;
let geomVertices = [];
let geomVertexNormals = [];
let geomTexCoords = [];
let geomVerticesIndices = [];

inSlices.onChange = inStacks.onChange = inRadius.onChange = function ()
{
    if (mesh)mesh.dispose();
    mesh = null;
};

op.preRender =
render.onTriggered = function ()
{
    if (!mesh) updateMesh();

    if (inRender.get()) mesh.render(cgl.getShader());

    trigger.trigger();
};

function updateMesh()
{
    let nslices = Math.round(inSlices.get());
    let nstacks = Math.round(inStacks.get());
    if (nslices < 1)nslices = 1;
    if (nstacks < 1)nstacks = 1;
    let r = inRadius.get();

    uvSphere(r, nslices, nstacks);
}

// updateMesh();

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

    for (i = 0; i < size; i++)
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

// from http://math.hws.edu/graphicsbook/source/webgl/basic-object-models-IFS.js
function uvSphere(radius, slices, stacks)
{
    let geom = new CGL.Geometry("sphere");

    radius = radius || 0.5;
    slices = slices || 32;
    stacks = stacks || 16;
    let vertexCount = (slices + 1) * (stacks + 1);
    let vertices = new Float32Array(3 * vertexCount);
    let normals = new Float32Array(3 * vertexCount);
    let texCoords = new Float32Array(2 * vertexCount);
    let indices = new Uint16Array(2 * slices * stacks * 3);
    let du = 2 * Math.PI / slices;
    let dv = Math.PI / stacks;
    let i, j, u, v, x, y, z;
    let indexV = 0;
    let indexT = 0;
    for (i = 0; i <= stacks; i++)
    {
        v = -Math.PI / 2 + i * dv;
        for (j = 0; j <= slices; j++)
        {
            u = j * du;
            x = Math.cos(u) * Math.cos(v);
            y = Math.sin(u) * Math.cos(v);
            z = Math.sin(v);

            vertices[indexV] = radius * x;
            normals[indexV++] = x;

            vertices[indexV] = radius * y;
            normals[indexV++] = y;

            vertices[indexV] = radius * z;
            normals[indexV++] = z;

            texCoords[indexT++] = j / slices;
            texCoords[indexT++] = i / stacks;
        }
    }
    let k = 0;
    for (j = 0; j < stacks; j++)
    {
        let row1 = j * (slices + 1);
        let row2 = (j + 1) * (slices + 1);
        for (i = 0; i < slices; i++)
        {
            indices[k++] = row1 + i;
            indices[k++] = row2 + i;
            indices[k++] = row2 + i + 1;

            indices[k++] = row1 + i;
            indices[k++] = row2 + i + 1;
            indices[k++] = row1 + i + 1;
        }
    }

    geom.vertices = vertices;
    geom.vertexNormals = normals;
    geom.texCoords = texCoords;
    geom.verticesIndices = indices;
    geom.glPrimitive = cgl.gl.TRIANGLE_STRIP;

    geomOut.set(geom);

    if (!mesh)mesh = new CGL.Mesh(cgl, geom);
    mesh.setGeom(geom);
}

op.onDelete = function ()
{
    if (mesh)mesh.dispose();
};
