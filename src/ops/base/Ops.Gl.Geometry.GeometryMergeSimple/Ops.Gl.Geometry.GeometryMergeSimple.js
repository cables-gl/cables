const
    inGeom = op.inObject("Geometry"),
    inGeom2 = op.inObject("Geometry 2"),
    outGeom = op.outObject("Geometry Result");

op.toWorkPortsNeedToBeLinked(inGeom);

let geom = new CGL.Geometry(op.name);
outGeom.set(geom);

inGeom.onChange =
inGeom2.onChange =
function ()
{
    if (inGeom.get() || inGeom2.get())
    {
        geom = new CGL.Geometry(op.name);
        if (inGeom.get())
        {
            geom = inGeom.get().copy();
        }
        if (inGeom2.get())geom.merge(inGeom2.get());
        outGeom.set(null);
        outGeom.set(geom);
    }
};
