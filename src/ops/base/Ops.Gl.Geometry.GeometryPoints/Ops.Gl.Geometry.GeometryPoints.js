const
    geometry=op.inObject("Geometry"),
    outVertices=op.outArray("Vertices"),
    outFaces=op.outArray("Faces"),
    outTextcoords=op.outArray("TexCoords"),
    outVertexColors=op.outArray("Vertex Colors"),
    outNormals=op.outArray("Normals"),
    outBiTangents=op.outArray("BiTangents"),
    outTangents=op.outArray("Tangents");


geometry.onChange=function()
{
    var geom=geometry.get();
    if(!geom) return;

    // convert float32array to array
    var verts =  Array.prototype.slice.call(geom.vertices);

    outVertices.set(verts);
    outFaces.set(geom.verticesIndices);
    outTextcoords.set(geom.texCoords);
    outNormals.set(geom.vertexNormals);
    outTangents.set(geom.tangents);
    outBiTangents.set(geom.biTangents);
    outVertexColors.set(geom.vertexColors[0]);
};