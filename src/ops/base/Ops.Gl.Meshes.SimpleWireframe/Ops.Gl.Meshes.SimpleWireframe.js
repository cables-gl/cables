const
    render = op.inTrigger("Render"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    next = op.outTrigger("Next");
const cgl = op.patch.cgl;

op.toWorkPortsNeedToBeLinked(inGeom);

render.onTriggered = doRender;

let mesh = null;
let verts = [];
let tc = [];
let normals = [];
let prim = cgl.gl.LINE_STRIP;

op.onDelete = function () { if (mesh)mesh.dispose(); };
inGeom.onChange = function ()
{
    let geom = inGeom.get();
    if (!geom)
    {
        mesh = null;
        return;
    }

    verts.length = 0;
    normals.length = 0;
    tc.length = 0;
    let i = 0;

    if (geom.isIndexed())
    {
        for (i = 0; i < geom.verticesIndices.length; i += 3)
        {
            let index = geom.verticesIndices[i + 0];
            let index1 = geom.verticesIndices[i + 1];
            let index2 = geom.verticesIndices[i + 2];

            verts.push(geom.vertices[index * 3 + 0], geom.vertices[index * 3 + 1], geom.vertices[index * 3 + 2]);
            verts.push(geom.vertices[index1 * 3 + 0], geom.vertices[index1 * 3 + 1], geom.vertices[index1 * 3 + 2]);
            verts.push(geom.vertices[index1 * 3 + 0], geom.vertices[index1 * 3 + 1], geom.vertices[index1 * 3 + 2]);
            verts.push(geom.vertices[index2 * 3 + 0], geom.vertices[index2 * 3 + 1], geom.vertices[index2 * 3 + 2]);
            verts.push(geom.vertices[index2 * 3 + 0], geom.vertices[index2 * 3 + 1], geom.vertices[index2 * 3 + 2]);
            verts.push(geom.vertices[index * 3 + 0], geom.vertices[index * 3 + 1], geom.vertices[index * 3 + 2]);

            normals.push(geom.vertexNormals[index * 3 + 0], geom.vertexNormals[index * 3 + 1], geom.vertexNormals[index * 3 + 2]);
            normals.push(geom.vertexNormals[index1 * 3 + 0], geom.vertexNormals[index1 * 3 + 1], geom.vertexNormals[index1 * 3 + 2]);
            normals.push(geom.vertexNormals[index1 * 3 + 0], geom.vertexNormals[index1 * 3 + 1], geom.vertexNormals[index1 * 3 + 2]);
            normals.push(geom.vertexNormals[index2 * 3 + 0], geom.vertexNormals[index2 * 3 + 1], geom.vertexNormals[index2 * 3 + 2]);
            normals.push(geom.vertexNormals[index2 * 3 + 0], geom.vertexNormals[index2 * 3 + 1], geom.vertexNormals[index2 * 3 + 2]);
            normals.push(geom.vertexNormals[index * 3 + 0], geom.vertexNormals[index * 3 + 1], geom.vertexNormals[index * 3 + 2]);

            tc.push(geom.texCoords[index * 2 + 0], geom.texCoords[index * 2 + 1]);
            tc.push(geom.texCoords[index1 * 2 + 0], geom.texCoords[index1 * 2 + 1]);
            tc.push(geom.texCoords[index1 * 2 + 0], geom.texCoords[index1 * 2 + 1]);
            tc.push(geom.texCoords[index2 * 2 + 0], geom.texCoords[index2 * 2 + 1]);
            tc.push(geom.texCoords[index2 * 2 + 0], geom.texCoords[index2 * 2 + 1]);
            tc.push(geom.texCoords[index * 2 + 0], geom.texCoords[index * 2 + 1]);
        }
        prim = cgl.gl.LINES;
    }
    else
    {
        for (i = 0; i < geom.vertices.length; i += 9)
        {
            verts.push(geom.vertices[i + 0], geom.vertices[i + 1], geom.vertices[i + 2]);
            verts.push(geom.vertices[i + 3], geom.vertices[i + 4], geom.vertices[i + 5]);

            verts.push(geom.vertices[i + 3], geom.vertices[i + 4], geom.vertices[i + 5]);
            verts.push(geom.vertices[i + 6], geom.vertices[i + 7], geom.vertices[i + 8]);

            verts.push(geom.vertices[i + 6], geom.vertices[i + 7], geom.vertices[i + 8]);
            verts.push(geom.vertices[i + 0], geom.vertices[i + 1], geom.vertices[i + 2]);
        }

        prim = cgl.gl.LINES;
    }

    geom = new CGL.Geometry("wireframelinegeom");
    // if(verts.length>60000)geom.setVertices(verts);
    // else
    geom.setVertices(verts);
    geom.setTexCoords(tc);
    geom.vertexNormals = normals;

    mesh = new CGL.Mesh(cgl, geom, prim);
};

function doRender()
{
    let shader = cgl.getShader();
    if (!shader) return;

    let oldPrim = shader.glPrimitive;
    shader.glPrimitive = prim;
    if (mesh) mesh.render(shader);
    shader.glPrimitive = oldPrim;
    next.trigger();
}
