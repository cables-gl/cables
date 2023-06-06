const
    geometry = op.inObject("Geometry"),
    outGeom = op.outObject("Result"),
    doFlip = op.inValueBool("Flip", true);

doFlip.onChange =
    geometry.onChange = flip;

function flip()
{
    let oldGeom = geometry.get();

    if (!oldGeom)
    {
        outGeom.set(null);
        return;
    }

    let geom = oldGeom.copy();

    if (doFlip.get())geom.flipVertDir();

    outGeom.set(null);
    outGeom.set(geom);
}
