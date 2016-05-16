op.name='RectangleFrame';
var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));

var width=op.addInPort(new Port(op,"Width",OP_PORT_TYPE_VALUE));
var height=op.addInPort(new Port(op,"Height",OP_PORT_TYPE_VALUE));

var thickness=op.addInPort(new Port(op,"Thickness",OP_PORT_TYPE_VALUE,{"display":"range"}));

width.set(1);
height.set(1);
thickness.set(0.2);

var geomOut=op.addOutPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var mesh=null;

render.onTriggered=function()
{
    mesh.render(cgl.getShader());
    trigger.trigger();
};

var geom=new CGL.Geometry();

function create()
{
    var x=-width.get()/2;
    var y=-height.get()/2;
    var th=thickness.get()*Math.min(height.get(),width.get())*-0.5;
 
    geom.vertices = [
        x,y,0,
        x+width.get(),y,0,
        x+width.get(),y+height.get(),0,
        x,y+height.get(),0,

        x-th, y-th,0,
        x+width.get()+th,y-th,0,
        x+width.get()+th,y+height.get()+th,0,
        x-th,y+height.get()+th,0,
    ];

    geom.vertexNormals = [
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
    ];
    
    geom.verticesIndices = [
        0, 1, 4,
        1, 5, 4,
        1, 2, 5,
        5, 2, 6,
        7, 6, 3,
        6, 2, 3,
        0, 4, 3,
        4, 7, 3,
    ];

    geom.texCoords=[];
    for(var i=0;i<geom.vertices.length;i+=3)
    {
        geom.texCoords.push(geom.vertices[i+0]/width.get()-0.5);
        geom.texCoords.push(geom.vertices[i+1]/height.get()-0.5);
    }

    mesh=new CGL.Mesh(cgl,geom);
    geomOut.set(null);
    geomOut.set(geom);
}

width.onValueChange(create);
height.onValueChange(create);
thickness.onValueChange(create);

create();