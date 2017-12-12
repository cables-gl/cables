var geometry=op.inObject("Geometry");

var outIndexed=op.outValue("Indexed",false);
var outFaces=op.outValue("Faces");
var outVertices=op.outValue("Vertices");
var outNormals=op.outValue("Normals");
var outTexCoords=op.outValue("TexCoords");
var outTangents=op.outValue("Tangents");
var outBiTangents=op.outValue("BiTangents");
var outVertexColors=op.outValue("VertexColors");

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

        outIndexed.set(geom.isIndexed());
    }

};