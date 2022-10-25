const
    inGeom = op.inObject("Geometry", null, "geometry"),
    inHeight = op.inFloat("Height", 0.5),
    inSmooth = op.inBool("Smooth", true),
    inExtrudeWalls = op.inBool("Walls", true),
    inCapTop = op.inBool("Top", true),
    inCapBottom = op.inBool("Bottom", true),
    outGeom = op.outObject("Result Geometry", null, "geometry");

function isClockwise(verts)
{
    let sum = 0.0;
    for (let i = 0; i < verts.length - 3; i += 3)
    {
        // Vector v1 = verts[i];
        // Vector v2 = verts[(i + 1) % verts.length];
        sum += (verts[i + 3] - verts[i]) * (verts[i + 3 + 1] + verts[i]);
    }
    return sum > 0.0;
}

inSmooth.onChange =
inExtrudeWalls.onChange =
inCapTop.onChange =
inCapBottom.onChange =
inHeight.onChange =
inGeom.onChange = () =>
{
    const geom = inGeom.get();

    if (!geom)
    {
        outGeom.set(null);
        return;
    }

    function edgesUsedMulti(idx1, idx2)
    {
        let count = 0;
        for (let i = 0; i < geom.verticesIndices.length; i += 3)
        {
            if (
                (
                    geom.verticesIndices[i] == idx1 ||
                    geom.verticesIndices[i + 1] == idx1 ||
                    geom.verticesIndices[i + 2] == idx1
                ) &&
                (
                    geom.verticesIndices[i] == idx2 ||
                    geom.verticesIndices[i + 1] == idx2 ||
                    geom.verticesIndices[i + 2] == idx2
                ))
            {
                count++;
                if (count == 2) return true;
            }
        }

        return false;
    }

    let verts = [];
    const indices = [];
    const h = inHeight.get();

    if (inExtrudeWalls.get())
        for (let i = 0; i < geom.verticesIndices.length; i += 3)
        {
            const vert1 = geom.verticesIndices[i];
            const vert2 = geom.verticesIndices[i + 1];
            const vert3 = geom.verticesIndices[i + 2];

            // 1
            if (!edgesUsedMulti(vert1, vert2))
            {
                const a = [];
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2]]);
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2] + h]);
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2]]);

                if (!isClockwise(a)) verts = verts.concat(a);
                else verts = verts.concat(a.reverse());

                a.length = 0;
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2] + h]);
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2]]);
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2] + h]);

                if (!isClockwise(a)) verts = verts.concat(a);
                else verts = verts.concat(a.reverse());
            }

            // 2
            if (!edgesUsedMulti(vert3, vert2))
            {
                const a = [];
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2]]);
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2] + h]);
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2]]);

                if (isClockwise(a)) verts = verts.concat(a);
                else verts = verts.concat(a.reverse());

                a.length = 0;

                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2] + h]);
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2]]);
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2] + h]);

                if (isClockwise(a)) verts = verts.concat(a);
                else verts = verts.concat(a.reverse());
            }
            // 3

            if (!edgesUsedMulti(vert3, vert1))
            {
                const a = [];
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2]]);
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2] + h]);
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2]]);

                if (!isClockwise(a)) verts = verts.concat(a);
                else verts = verts.concat(a.reverse());

                a.length = 0;

                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2] + h]);
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2]]);
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2] + h]);

                if (!isClockwise(a)) verts = verts.concat(a);
                else verts = verts.concat(a.reverse());
            }
        }

    const newGeom = CGL.Geometry.buildFromFaces(verts, "extrude", true);

    newGeom.calculateNormals();
    newGeom.calcTangentsBitangents();

    if (inCapBottom.get())
    {
        newGeom.merge(geom);
    }

    if (inCapTop.get())
    {
        const flippedgeo = geom.copy();

        for (let i = 0; i < flippedgeo.vertices.length; i += 3)
            flippedgeo.vertices[i + 2] += h;

        flippedgeo.flipVertDir();
        flippedgeo.flipNormals();
        newGeom.merge(flippedgeo);
    }

    newGeom.flipVertDir();

    if (!inSmooth.get())
    {
        newGeom.unIndex();
        newGeom.calculateNormals({ "forceZUp": true });
        newGeom.flipNormals();
    }

    outGeom.set(null);
    outGeom.set(newGeom);
};
