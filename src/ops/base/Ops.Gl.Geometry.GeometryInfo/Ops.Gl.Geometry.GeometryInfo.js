const
    geometry=op.inObject("Geometry"),
    outIndexed=op.outValue("Indexed",false),
    outFaces=op.outValue("Faces"),
    outVertices=op.outValue("Vertices"),
    outNormals=op.outValue("Normals"),
    outTexCoords=op.outValue("TexCoords"),
    outTangents=op.outValue("Tangents"),
    outBiTangents=op.outValue("BiTangents"),
    outVertexColors=op.outValue("VertexColors"),
    outAttribs=op.outValue("Other Attributes");

geometry.onChange=function()
{
    var geom=geometry.get();
    if(geom)
    {
        outFaces.set(geom.verticesIndices.length/3);

        if(geom.vertices) outVertices.set(geom.vertices.length/3);
            else outVertices.set(0);

        if(geom.vertexNormals) outNormals.set(geom.vertexNormals.length/3);
            else outNormals.set(0);

        if(geom.texCoords) outTexCoords.set(geom.texCoords.length/2);
            else outTexCoords.set(0);

        if(geom.tangents) outTangents.set(geom.tangents.length/3);
            else outTangents.set(0);

        if(geom.biTangents) outBiTangents.set(geom.biTangents.length/3);
            else outBiTangents.set(0);

        if(geom.biTangents) outBiTangents.set(geom.biTangents.length/3);
            else outBiTangents.set(0);

        if(geom.vertexColors) outVertexColors.set(geom.vertexColors.length/3);
            else outVertexColors.set(0);

        if(geom.getAttributes()) outAttribs.set(Object.keys(geom.getAttributes()).length);
            else outAttribs.set(0);

        outIndexed.set(geom.isIndexed());
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