const
    geometry = op.inObject("Geometry"),
    outVertices = op.outArray("Vertices", 3),
    outFaces = op.outArray("Faces", 3),
    outTextcoords = op.outArray("TexCoords", 2),
    outVertexColors = op.outArray("Vertex Colors", 4),
    outNormals = op.outArray("Normals", 3),
    outBiTangents = op.outArray("BiTangents", 3),
    outTangents = op.outArray("Tangents", 3);

geometry.onChange = function ()
{
    let geom = geometry.get();
    if (!geom) return;

    // convert float32array to array
    let verts = Array.prototype.slice.call(geom.vertices);

    outVertices.set(verts);
    outFaces.set(geom.verticesIndices);
    outTextcoords.set(geom.texCoords);
    outNormals.set(geom.vertexNormals);
    outTangents.set(geom.tangents);
    outBiTangents.set(geom.biTangents);
    outVertexColors.set(geom.vertexColors);
};
