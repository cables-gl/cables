
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));
geometry.ignoreValueSerialize=true;

var updateAll=op.inValueBool('Update All',true);
var updateFaces=op.inValueBool('Update Face Indices',false);
var updateVerts=op.inValueBool('Update Vertices',false);
var updateTexcoords=op.inValueBool('Update Texcoords',false);
var vertNums=op.inValueBool('Vertex Numbers',true);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

vertNums.onChange=
    geometry.onChange=update;

var mesh=null;

render.onTriggered=function()
{
    if(mesh) mesh.render(op.patch.cgl.getShader());
    trigger.trigger();
};


function update()
{

    var geom=geometry.get();
    
    if(geom)
    {
        // if(mesh)mesh.dispose();
        if(!mesh)
        {
            mesh=new CGL.Mesh(op.patch.cgl,geom);
            mesh.addVertexNumbers=vertNums.get();
            mesh.setGeom(geom); 
        }
        

        if(updateFaces.get() || updateAll.get())
        {
            mesh.setVertexIndices(geom.verticesIndices);
        }

        if(updateTexcoords.get() || updateAll.get())
        {
            mesh.updateTexCoords(geom);
        }

        if(updateVerts.get() || updateAll.get())
        {
            mesh.updateVertices(geom);
        }

        mesh.addVertexNumbers=vertNums.get();
        
    }
    else
    {
        mesh=null;
    }
}

