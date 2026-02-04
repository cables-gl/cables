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

function triangleNormal(a, b, c)
{
    // console.log(a, b, c);
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; // Edge AB
    const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]; // Edge AC

    // Cross product U × V
    const nx = u[1] * v[2] - u[2] * v[1];
    const ny = u[2] * v[0] - u[0] * v[2];
    const nz = u[0] * v[1] - u[1] * v[0];

    // Magnitude
    const mag = Math.sqrt(nx * nx + ny * ny + nz * nz);

    // Normalize (avoid div by zero)
    return mag > 0 ? [nx / mag, ny / mag, nz / mag] : [0, 0, 0];
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
    let norms = [];
    const h = Math.min(inHeight.get(), -inHeight.get());

    if (inExtrudeWalls.get())
        for (let i = 0; i < geom.verticesIndices.length; i += 3)
        {
            let n = [0, 0, 0];
            const vert1 = geom.verticesIndices[i];
            const vert2 = geom.verticesIndices[i + 1];
            const vert3 = geom.verticesIndices[i + 2];

            let a = [];

            // 1
            if (!edgesUsedMulti(vert1, vert2))
            {
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2]]);
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2] + h]);
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2]]);
                verts = verts.concat(a);

                n = triangleNormal(a[0], a[1], a[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);

                a.length = 0;
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2] + h]);
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2]]);
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2] + h]);
                verts = verts.concat(a);

                n = triangleNormal(a[0], a[1], a[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);
            }

            // 2
            if (!edgesUsedMulti(vert3, vert2))
            {
                a.length = 0;
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2]]);
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2]]);
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2] + h]);
                verts = verts.concat(a);

                n = triangleNormal(a[0], a[1], a[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);

                a.length = 0;
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2] + h]);
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2] + h]);
                a.push([geom.vertices[vert2 * 3 + 0], geom.vertices[vert2 * 3 + 1], geom.vertices[vert2 * 3 + 2]]);
                verts = verts.concat(a);

                n = triangleNormal(a[0], a[1], a[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);
            }
            // 3

            if (!edgesUsedMulti(vert3, vert1))
            {
                a.length = 0;
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2]]);
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2] + h]);
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2]]);
                verts = verts.concat(a);

                n = triangleNormal(a[0], a[1], a[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);

                a.length = 0;
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2] + h]);
                a.push([geom.vertices[vert1 * 3 + 0], geom.vertices[vert1 * 3 + 1], geom.vertices[vert1 * 3 + 2]]);
                a.push([geom.vertices[vert3 * 3 + 0], geom.vertices[vert3 * 3 + 1], geom.vertices[vert3 * 3 + 2] + h]);
                verts = verts.concat(a);

                n = triangleNormal(a[0], a[1], a[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);
                norms.push(n[0], n[1], n[2]);
            }
        }

    const newGeom = CGL.Geometry.buildFromFaces(verts, "extrude", true);
    newGeom.calculateNormals();
    newGeom.calcTangentsBitangents();

    newGeom.vertexNormals = norms;

    // geom.unIndex()
    if (inCapBottom.get()) newGeom.merge(geom);

    if (inCapTop.get())
    {
        const flippedgeo = geom.copy();

        flippedgeo.flipVertDir();

        for (let i = 0; i < flippedgeo.vertices.length; i += 3)
        {
            flippedgeo.vertices[i + 2] += h;
        }

        flippedgeo.flipNormals();
        newGeom.merge(flippedgeo);
        newGeom.flipVertDir();
    }

    newGeom.flipVertDir();

    // if (!inSmooth.get())
    // {
    //     newGeom.unIndex();
    //     newGeom.calculateNormals();
    //     newGeom.flipNormals();
    // }

    outGeom.setRef(newGeom);
};
