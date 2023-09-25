const
    inGeom = op.inObject("Geometry"),
    outArr = op.outArray("Array");

inGeom.onChange = function ()
{
    const g = inGeom.get();


    if (!g)
    {
        outArr.set(null);

        return;
    }

    const arr = [];

    for (let i = 0; i < g.verticesIndices.length; i += 3)
    {
        arr.push(
            g.vertices[g.verticesIndices[i + 0] * 3 + 0],
            g.vertices[g.verticesIndices[i + 0] * 3 + 1],
            g.vertices[g.verticesIndices[i + 0] * 3 + 2],

            g.vertices[g.verticesIndices[i + 1] * 3 + 0],
            g.vertices[g.verticesIndices[i + 1] * 3 + 1],
            g.vertices[g.verticesIndices[i + 1] * 3 + 2],

            g.vertices[g.verticesIndices[i + 1] * 3 + 0],
            g.vertices[g.verticesIndices[i + 1] * 3 + 1],
            g.vertices[g.verticesIndices[i + 1] * 3 + 2],

            g.vertices[g.verticesIndices[i + 2] * 3 + 0],
            g.vertices[g.verticesIndices[i + 2] * 3 + 1],
            g.vertices[g.verticesIndices[i + 2] * 3 + 2],

            g.vertices[g.verticesIndices[i + 2] * 3 + 0],
            g.vertices[g.verticesIndices[i + 2] * 3 + 1],
            g.vertices[g.verticesIndices[i + 2] * 3 + 2],

            g.vertices[g.verticesIndices[i + 0] * 3 + 0],
            g.vertices[g.verticesIndices[i + 0] * 3 + 1],
            g.vertices[g.verticesIndices[i + 0] * 3 + 2]);
    }

    outArr.setRef(arr);
};
