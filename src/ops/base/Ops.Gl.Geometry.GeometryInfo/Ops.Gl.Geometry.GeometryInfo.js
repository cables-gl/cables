const
    geometry = op.inObject("Geometry", null, "geometry"),
    outIndexed = op.outValue("Indexed", false),
    outFaces = op.outValue("Faces"),
    outVertices = op.outValue("Vertices"),
    outNormals = op.outValue("Normals"),
    outTexCoords = op.outValue("TexCoords"),
    outTangents = op.outValue("Tangents"),
    outBiTangents = op.outValue("BiTangents"),
    outVertexColors = op.outValue("VertexColors"),
    outAttribs = op.outValue("Other Attributes");

geometry.onLinkChanged = () =>
{
};

geometry.onChange = function ()
{
    let geom = geometry.get();
    if (geom)
    {
        info = geom.getInfo();
        outFaces.set(info.Faces);
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
