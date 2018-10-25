
var geometry=op.addInPort(new CABLES.Port(op,"Geometry",CABLES.OP_PORT_TYPE_OBJECT));
var outGeom=op.outObject("Result");

geometry.onChange=update;


function update()
{
    outGeom.set(null);
    if(geometry.get())
    {
        var geom=geometry.get();
        var newGeom=new CGL.Geometry();
        
        var newVerts=[];
        var newFaces=[];
        var newNormals=[];
        var newTexCoords=[];
        
        for(var i=0;i<geom.verticesIndices.length;i+=3)
        {
            newFaces.push( newVerts.length/3 );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+0]*3+0] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+0]*3+1] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+0]*3+2] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+0]*3+0] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+0]*3+1] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+0]*3+2] );
            newTexCoords.push( geom.texCoords[ geom.verticesIndices[i+0]*2+0] );
            newTexCoords.push( geom.texCoords[ geom.verticesIndices[i+0]*2+1] );

            newFaces.push( newVerts.length/3 );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+1]*3+0] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+1]*3+1] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+1]*3+2] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+1]*3+0] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+1]*3+1] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+1]*3+2] );
            newTexCoords.push( geom.texCoords[ geom.verticesIndices[i+1]*2+0] );
            newTexCoords.push( geom.texCoords[ geom.verticesIndices[i+1]*2+1] );

            newFaces.push( newVerts.length/3 );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+2]*3+0] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+2]*3+1] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+2]*3+2] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+2]*3+0] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+2]*3+1] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+2]*3+2] );
            newTexCoords.push( geom.texCoords[ geom.verticesIndices[i+2]*2+0] );
            newTexCoords.push( geom.texCoords[ geom.verticesIndices[i+2]*2+1] );
        }
        
        newGeom.vertices=newVerts;
        newGeom.vertexNormals=newNormals;
        newGeom.verticesIndices=newFaces;
        newGeom.setTexCoords(newTexCoords);

        outGeom.set(newGeom);
    }
}

