
var render=op.inFunction("Render");

var geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));



// var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var trigger=op.outFunction("Next");
geometry.onChange=update;

var mesh=null;

render.onTriggered=function()
{
    if(mesh) mesh.render(op.patch.cgl.getShader());
    trigger.trigger();
};


function update()
{
    mesh=null;
    
    if(geometry.get())
    {
        if(mesh)mesh.dispose();
        var geom=geometry.get();
        var newGeom=new CGL.Geometry();
        
        var newVerts=[];
        var newFaces=[];
        var newNormals=[];
        
        for(var i=0;i<geom.verticesIndices.length;i+=3)
        {
            newFaces.push( newVerts.length/3 );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+0]*3+0] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+0]*3+1] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+0]*3+2] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+0]*3+0] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+0]*3+1] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+0]*3+2] );

            newFaces.push( newVerts.length/3 );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+1]*3+0] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+1]*3+1] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+1]*3+2] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+1]*3+0] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+1]*3+1] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+1]*3+2] );

            newFaces.push( newVerts.length/3 );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+2]*3+0] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+2]*3+1] );
            newVerts.push( geom.vertices[ geom.verticesIndices[i+2]*3+2] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+2]*3+0] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+2]*3+1] );
            newNormals.push( geom.vertexNormals[ geom.verticesIndices[i+2]*3+2] );

        }
        
        console.log(newVerts.length);
        console.log(newFaces);
        newGeom.vertices=newVerts;
        newGeom.vertexNormals=newNormals;
        newGeom.verticesIndices=newFaces;
        
        mesh=new CGL.Mesh(op.patch.cgl,newGeom);
        mesh.addVertexNumbers=true;
        mesh.setGeom(newGeom);
    }
}

