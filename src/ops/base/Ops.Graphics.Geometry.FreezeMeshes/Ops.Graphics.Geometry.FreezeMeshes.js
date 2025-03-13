const
    inCapture = op.inTriggerButton("Capture"),
    outGeom = op.outObject("Geometry", null, "geometry"),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;
let shouldCapture = false;
let geom = null;

inCapture.onTriggered = () =>
{
    shouldCapture = true;
    if (shouldCapture)
    {
        geom = new CGL.Geometry();

        const old = CGL.Mesh.prototype.render;
        CGL.Mesh.prototype.render = meshCapture;

        next.trigger();

        CGL.Mesh.prototype.render = old;
        shouldCapture = false;

        // geom.unIndex(false, true);

        outGeom.set(null);
        outGeom.set(geom);
    }
};

function meshCapture()
{
    if (!this.geom || !this.geom.copy)
    {
        return;
    }

    const g = this.geom.copy();
    const normalMat = mat4.create();
    mat4.invert(normalMat, cgl.mMatrix);
    mat4.transpose(normalMat, normalMat);

    for (let i = 0; i < g.vertices.length; i += 3)
    {
        const v = [g.vertices[i + 0], g.vertices[i + 1], g.vertices[i + 2]];

        vec3.transformMat4(v, v, cgl.mMatrix);

        g.vertices[i + 0] = v[0];
        g.vertices[i + 1] = v[1];
        g.vertices[i + 2] = v[2];

        // ----------

        const vn = [g.vertexNormals[i + 0], g.vertexNormals[i + 1], g.vertexNormals[i + 2], 1];
        vec4.transformMat4(vn, vn, normalMat);

        g.vertexNormals[i + 0] = vn[0];
        g.vertexNormals[i + 1] = vn[1];
        g.vertexNormals[i + 2] = vn[2];
    }

    // g.unIndex();
    geom.merge(g);
}
