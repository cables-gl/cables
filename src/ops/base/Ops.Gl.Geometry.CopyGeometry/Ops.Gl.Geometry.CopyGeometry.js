const
    geometry = op.inObject("Geometry"),
    outGeom = op.outObject("Result");

geometry.onChange = update;

function update()
{
    let oldGeom = geometry.get();

    if (oldGeom)
    {
        let geom = oldGeom.copy();

        outGeom.set(geom);
    }
    else outGeom.set(null);
}
