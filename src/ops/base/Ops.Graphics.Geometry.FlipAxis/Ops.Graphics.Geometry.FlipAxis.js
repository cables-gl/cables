const
    geometry = op.inObject("Geometry"),
    ax = op.inSwitch("Axis 1", ["NONE", "XY", "YZ", "ZX"], "NONE"),
    outGeom = op.outObject("Result");

ax.onChange =
    geometry.onChange = update;

let geom = null;

function update()
{
    const oldGeom = geometry.get();

    if (!oldGeom)
    {
        outGeom.set(null);
        return;
    }

    const bounds = oldGeom.getBounds();
    geom = oldGeom.copy();

    let index0 = 0;
    let index1 = 1;
    let index2 = 2;

    if (ax.get() == "XY")
    {
        index0 = 1;
        index1 = 0;
    }
    if (ax.get() == "YZ")
    {
        index1 = 2;
        index2 = 1;
    }
    if (ax.get() == "ZX")
    {
        index0 = 2;
        index2 = 0;
    }

    for (let i = 0; i < geom.vertices.length; i += 3)
    {
        geom.vertices[i + 0] = oldGeom.vertices[i + index0];
        geom.vertices[i + 1] = oldGeom.vertices[i + index1];
        geom.vertices[i + 2] = oldGeom.vertices[i + index2];

        geom.vertexNormals[i + 0] = oldGeom.vertexNormals[i + index0];
        geom.vertexNormals[i + 1] = oldGeom.vertexNormals[i + index1];
        geom.vertexNormals[i + 2] = oldGeom.vertexNormals[i + index2];

        geom.tangents[i + 0] = oldGeom.tangents[i + index0];
        geom.tangents[i + 1] = oldGeom.tangents[i + index1];
        geom.tangents[i + 2] = oldGeom.tangents[i + index2];

        geom.biTangents[i + 0] = oldGeom.biTangents[i + index0];
        geom.biTangents[i + 1] = oldGeom.biTangents[i + index1];
        geom.biTangents[i + 2] = oldGeom.biTangents[i + index2];
    }

    outGeom.setRef(geom);
}
