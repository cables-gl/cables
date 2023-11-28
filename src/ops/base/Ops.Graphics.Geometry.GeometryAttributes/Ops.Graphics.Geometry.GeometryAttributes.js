const
    geometry = op.inObject("Geometry"),
    outFaces = op.outArray("Faces", 3),
    outVertices = op.outArray("Vertices", 3),
    outNormals = op.outArray("Normals", 3),
    outTextcoords = op.outArray("TexCoords", 2),
    outVertexColors = op.outArray("Vertex Colors", 4),
    outTangents = op.outArray("Tangents", 3),
    outBiTangents = op.outArray("BiTangents", 3);

geometry.onChange = function ()
{
    let geom = geometry.get();
    if (!geom)
    {
        outVertices.setRef(null);
        outFaces.setRef(null);
        outTextcoords.setRef(null);
        outNormals.setRef(null);
        outTangents.setRef(null);
        outBiTangents.setRef(null);
        outVertexColors.setRef(null);

        return;
    }

    // convert float32array to array
    let verts = Array.prototype.slice.call(geom.vertices);

    outVertices.setRef(verts);
    outFaces.setRef(geom.verticesIndices);
    outTextcoords.setRef(geom.texCoords);
    outNormals.setRef(geom.vertexNormals);
    outTangents.setRef(geom.tangents);
    outBiTangents.setRef(geom.biTangents);
    outVertexColors.setRef(geom.vertexColors);
};
