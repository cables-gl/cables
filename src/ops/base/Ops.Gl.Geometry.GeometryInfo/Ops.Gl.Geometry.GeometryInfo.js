const
    geometry = op.inObject("Geometry", null, "geometry"),
    outIndexed = op.outBoolNum("Indexed", false),
    outFaces = op.outNumber("Faces"),
    outIndices = op.outNumber("Indices"),
    outVertices = op.outNumber("Vertices"),
    outNormals = op.outNumber("Normals"),
    outTexCoords = op.outNumber("TexCoords"),
    outTangents = op.outNumber("Tangents"),
    outBiTangents = op.outNumber("BiTangents"),
    outVertexColors = op.outNumber("VertexColors"),
    outAttribs = op.outNumber("Other Attributes");

geometry.onLinkChanged = () =>
{
};

geometry.onChange = function ()
{
    let geom = geometry.get();
    if (geom && geom.isGeometry)
    {
        const info = geom.getInfo();
        outFaces.set(info.numFaces);
        outIndices.set(info.indices || info.indices);
        outVertices.set(info.numVerts);
        outNormals.set(info.numNormals);
        outTexCoords.set(info.numTexCoords);
        outTangents.set(info.numTangents);
        outBiTangents.set(info.numBiTangents);
        outVertexColors.set(info.numVertexColors);
        outAttribs.set(info.numAttribs);
        outIndexed.set(info.isIndexed);
    }
    else
    {
        outIndexed.set(null);
        outFaces.set(null);
        outVertices.set(null);
        outNormals.set(null);
        outTexCoords.set(null);
        outTangents.set(null);
        outBiTangents.set(null);
        outVertexColors.set(null);
        outAttribs.set(null);
    }
};
