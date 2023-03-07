const
    geometry = op.inObject("Geometry", null, "geometry"),
    result = op.outObject("Result", null, "geometry");

geometry.onChange = function ()
{
    let geom = geometry.get();

    if (geom && geom.isGeometry)
    {
        if (!geom.isIndexed())
        {
            result.set(geom);
            return;
        }

        const newGeom = geom.copy();
        newGeom.unIndex(false, true);

        result.set(newGeom);
    }
    else result.set(null);
};
