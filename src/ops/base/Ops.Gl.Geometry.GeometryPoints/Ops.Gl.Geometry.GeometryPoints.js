const geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));

const  outVertices=op.outArray("Vertices");
const  outFaces=op.outArray("Faces");
const  outTextcoords=op.outArray("TexCoords");
const  outNormals=op.outArray("Normals");

geometry.onChange=function()
{
    var geom=geometry.get();
    if(!geom) return;

    outVertices.set(geom.vertices);
    outFaces.set(geom.verticesIndices);
    outTextcoords.set(geom.texCoords);
    outNormals.set(geom.vertexNormals);
};