const
    geometry = op.inObject("Geometry", null, "geometry"),
    result = op.outObject("Result", null, "geometry");

geometry.onChange = function ()
{
    const geom = geometry.get();

    if (geom && geom.isGeometry)
    {
        if (!geom.isIndexed())
        {
            result.setRef(geom);
            return;
        }

        const newGeom = geom.copy();
        newGeom.unIndex(false, true);

        result.setRef(newGeom);
    }
    else result.set(null);
};
