var geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));

var outVertices=op.outArray("Vertices");
var outFaces=op.outArray("Faces");
var outTextcoords=op.outArray("TexCoords");

geometry.onChange=function()
{
    var geom=geometry.get();
    if(geom)
    {
        outVertices.set(geom.vertices);
        outFaces.set(geom.verticesIndices);
        outTextcoords.set(geom.texCoords);
    }
};