const
    inGeom = op.inObject("Geometry"),
    inGeom2 = op.inObject("Geometry 2"),
    outGeom = op.outObject("Geometry Result");

const geom = new CGL.Geometry(op.name);
outGeom.set(geom);

inGeom.onChange =
inGeom2.onChange =
function ()
{
    if (inGeom.get() || inGeom2.get())
    {
        geom.clear();
        if (inGeom.get())geom.merge(inGeom.get());
        if (inGeom2.get())geom.merge(inGeom2.get());
        outGeom.set(null);
        outGeom.set(geom);
    }
};
