const
    inGeom = op.inObject("Geometry"),
    inGeom2 = op.inObject("Geometry 2"),
    inMerge = op.inTriggerButton("Merge"),
    inReset = op.inTriggerButton("Reset"),
    outGeom = op.outObject("Geometry Result");

const geom = new CGL.Geometry(op.name);

outGeom.set(geom);

inReset.onTriggered = function ()
{
    geom.clear();
    outGeom.set(null);
    outGeom.set(geom);
};

inMerge.onTriggered = function ()
{
    if (inGeom.get() || inGeom2.get())
    {
        if (inGeom.get())geom.merge(inGeom.get());
        if (inGeom2.get())geom.merge(inGeom2.get());
        outGeom.set(null);
        outGeom.set(geom);
    }
};
