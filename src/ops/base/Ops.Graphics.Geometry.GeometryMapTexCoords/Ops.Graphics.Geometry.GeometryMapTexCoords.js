const
    inGeom = op.inObject("Geometry", null, "geometry"),
    inAxis = op.inSwitch("Axis", ["XY", "XZ", "YZ"], "XY"),
    outGeom = op.outObject("Result Geometry", null, "geometry");

op.toWorkPortsNeedToBeLinked(inGeom);

inAxis.onChange =
inGeom.onChange = () =>
{
    const oldgeom = inGeom.get();
    if (!oldgeom) return outGeom.setRef(null);

    const geom = oldgeom.copy();
    const b = geom.getBounds();
    console.log(b);

    if (inAxis.get() == "XY")
        for (let i = 0; i < geom.texCoords.length; i += 2)
        {
            geom.texCoords[i + 0] = CABLES.map(geom.vertices[i / 2 * 3 + 0], b.minX, b.maxX, 0, 1);
            geom.texCoords[i + 1] = CABLES.map(geom.vertices[i / 2 * 3 + 1], b.minY, b.maxY, 0, 1);
        }

    if (inAxis.get() == "XZ")
        for (let i = 0; i < geom.texCoords.length; i += 2)
        {
            geom.texCoords[i + 0] = CABLES.map(geom.vertices[i / 2 * 3 + 0], b.minX, b.maxX, 0, 1);
            geom.texCoords[i + 1] = CABLES.map(geom.vertices[i / 2 * 3 + 2], b.minZ, b.maxZ, 0, 1);
        }

    if (inAxis.get() == "YZ")
        for (let i = 0; i < geom.texCoords.length; i += 2)
        {
            geom.texCoords[i + 0] = CABLES.map(geom.vertices[i / 2 * 3 + 1], b.minY, b.maxY, 0, 1);
            geom.texCoords[i + 1] = CABLES.map(geom.vertices[i / 2 * 3 + 2], b.minZ, b.maxZ, 0, 1);
        }

    outGeom.setRef(geom);
};
