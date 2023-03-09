const
    render = op.inTrigger("render"),
    geometry = op.inObject("Geometry", null, "geometry"),
    inActive = op.inBool("Render", true),
    trigger = op.outTrigger("trigger");

op.toWorkPortsNeedToBeLinked(geometry, render);

geometry.ignoreValueSerialize = true;
geometry.onChange = update;

let mesh = null;

render.onTriggered = function ()
{
    if (mesh && inActive.get()) mesh.render(op.patch.cgl.getShader());
    trigger.trigger();
};

function update()
{
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
            mesh.setGeom(geom);
        }
    }
    else
    {
        mesh = null;
    }
}
