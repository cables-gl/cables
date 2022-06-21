const
    geometry = op.inObject("Geometry"),
    result = op.outObject("Result");

geometry.onChange = function ()
{
    let geom = geometry.get();

    if (geom)
    {
        if (!geom.isIndexed())
        {
            result.set(geom);
            return;
        }

        const newGeom = geom.copy();
        newGeom.unIndex();
        result.set(newGeom);
    }
    else result.set(null);
};
