const
    inGeom = op.inObject("Geometry"),
    outGeom = op.outObject("Result"),
    inSeed = op.inValue("Seed", 1);

inGeom.ignoreValueSerialize = true;
outGeom.ignoreValueSerialize = true;

inSeed.onChange =
inGeom.onChange = function ()
{
    const geom = inGeom.get();
    if (!geom) return;
    if (geom.verticesIndices && geom.verticesIndices.length > 0)
    {
        op.logError("cannot randomize indexed geom ");
        return;
    }

    const newGeom = geom.copy();
    let order = [];
    let i = 0;
    order.length = geom.vertices.length / 9;
    for (i = 0; i < order.length; i++)order[i] = i;
    Math.randomSeed = inSeed.get();
    order = CABLES.shuffleArray(order);

    const verts = [];
    verts.length = geom.vertices.length;

    for (i = 0; i < order.length; i++)
    {
        const ind = order[i];
        for (let j = 0; j < 9; j++)
            verts[i * 9 + j] = geom.vertices[ind * 9 + j];
    }

    newGeom.setVertices(verts);

    outGeom.set(null);
    outGeom.set(newGeom);
};
