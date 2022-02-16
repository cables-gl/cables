const
    render = op.inTrigger("Render"),
    inArr = op.inArray("Points"),
    next = op.outTrigger("Next"),
    geomOut = op.outObject("Geometry"),
    geom = new CGL.Geometry("triangle array");

let mesh = null;
let verts = null;
const cgl = op.patch.cgl;

op.toWorkPortsNeedToBeLinked(inArr, render);

inArr.onChange = function ()
{
    verts = inArr.get();
    if (!verts) return;

    let tc = [];

    if (verts && mesh && geom.vertices.length == verts.length)
    {
        let attr = mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, verts, 3);
        attr.numItems = verts.length / 3;
        return;
    }

    for (let i = 0; i < verts.length / 3; i++)
    {
        tc.push(0, 0,
            0, 1,
            1, 1);
    }

    geom.vertices = verts;
    geom.texCoords = tc;
    geom.calculateNormals();

    mesh = new CGL.Mesh(cgl, geom);
    geomOut.set(null);
    geomOut.set(geom);
};

render.onTriggered = function ()
{
    if (mesh && verts)mesh.render(cgl.getShader());
    next.trigger();
};
