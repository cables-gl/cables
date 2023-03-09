const
    inGeo = op.inObject("Geometry", null, "geometry"),
    outStr = op.outString("Obj");

op.toWorkPortsNeedToBeLinked(inGeo);

function decimal(n)
{
    return Math.round(n * 10000000) / 10000000;
}

inGeo.onChange = () =>
{
    const geom = inGeo.get();

    if (!geom)
    {
        outStr.set(null);
        return;
    }

    let str = "# made with cables.gl".endl().endl();

    str += "# " + JSON.stringify(geom.getInfo());
    str += "".endl();
    str += "".endl();

    // vertices
    for (let i = 0; i < geom.vertices.length; i += 3)
    {
        str += "v " + decimal(geom.vertices[i + 0]) + " " + decimal(geom.vertices[i + 1]) + " " + decimal(geom.vertices[i + 2]) + "".endl();
    }

    str += "".endl();

    // normals
    for (let i = 0; i < geom.vertexNormals.length; i += 3)
    {
        str += "vn " + decimal(geom.vertexNormals[i + 0]) + " " + decimal(geom.vertexNormals[i + 1]) + " " + decimal(geom.vertexNormals[i + 2]) + "".endl();
    }

    str += "".endl();

    // texcoords
    for (let i = 0; i < geom.texCoords.length; i += 2)
    {
        str += "vt " + decimal(geom.texCoords[i + 0]) + " " + decimal(geom.texCoords[i + 1]) + " 0".endl();
    }

    str += "".endl();

    // faces
    if (geom.verticesIndices.length)
    {
        for (let i = 0; i < geom.verticesIndices.length; i += 3)
        {
            str += "f ";
            for (let j = 0; j < 3; j++)
            {
                str += (geom.verticesIndices[i + j] + 1) + "/" + (geom.verticesIndices[i + j] + 1) + "/" + (geom.verticesIndices[i + j] + 1) + " ";
            }
            str += "".endl();
        }
    }
    else
    {
        for (let i = 0; i < geom.vertices.length / 3 - 1; i += 3)
        {
            str += "f " + i + " " + (i + 1) + " " + (i + 2) + " ".endl();
        }
    }

    // str += "".endl();

    outStr.set(str);
};
