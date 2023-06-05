const
    render = op.inTrigger("render"),
    geometry = op.inObject("Geometry", null, "geometry"),

    inVertNums = op.inBool("Add Vertex Numbers", true),
    inActive = op.inBool("Render", true),
    trigger = op.outTrigger("trigger");

op.toWorkPortsNeedToBeLinked(geometry, render);

geometry.ignoreValueSerialize = true;

let mesh = null;
let needsUpdate = true;

geometry.onLinkChanged =
inVertNums.onChange =
    geometry.onChange = () => { needsUpdate = true; };

render.onTriggered = function ()
{
    if (needsUpdate) update();
    if (mesh && inActive.get()) mesh.render(op.patch.cgl.getShader());
    trigger.trigger();
};

function update()
{
    needsUpdate = false;
    const geom = geometry.get();
    if (geom && geom.isGeometry)
    {
        if (mesh)
        {
            mesh.dispose();
            mesh = null;
        }
        if (!mesh)
        {
            mesh = new CGL.Mesh(op.patch.cgl, geom);
            mesh.addVertexNumbers = inVertNums.get();
            mesh.setGeom(geom);
        }
    }
    else
    {
        mesh = null;
    }
}
