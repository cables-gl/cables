const
    geometry=op.inObject("Geometry"),
    outVertices=op.outArray("Vertices"),
    outFaces=op.outArray("Faces"),
    outTextcoords=op.outArray("TexCoords"),
    outNormals=op.outArray("Normals");

geometry.onChange=function()
{
    var geom=geometry.get();
    if(!geom) return;

    outVertices.set(geom.vertices);
    outFaces.set(geom.verticesIndices);
    outTextcoords.set(geom.texCoords);
    outNormals.set(geom.vertexNormals);
};