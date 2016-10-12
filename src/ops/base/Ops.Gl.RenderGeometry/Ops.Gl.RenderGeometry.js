op.name="RenderGeometry";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));
geometry.ignoreValueSerialize=true;


var updateAll=op.inValueBool('Update All',true);
var updateVerts=op.inValueBool('Update Vertices',false);
var updateTexcoords=op.inValueBool('Update Texcoords',false);
var vertNums=op.inValueBool('Vertex Numbers',false);


var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

geometry.onChange=update;
vertNums.onChange=function()
{
    mesh=null;
    update();
};

var mesh=null;

render.onTriggered=function()
{
    if(mesh) mesh.render(op.patch.cgl.getShader());
    trigger.trigger();
};


function update()
{
    if(geometry.get())
    {
        if(!mesh) 
        {
            mesh=new CGL.Mesh(op.patch.cgl,geometry.get());
        }
        else 
        {
            if(updateAll.get())
            {
                mesh.setGeom(geometry.get());
            }
            if(updateTexcoords.get())
            {
                mesh.updateTexCoords(geometry.get());
            }
            if(updateVerts.get())
            {
                mesh.updateVertices(geometry.get());
            }
            
        }

        mesh.addVertexNumbers=vertNums.get();
        mesh.setGeom(geometry.get());


    }
}

