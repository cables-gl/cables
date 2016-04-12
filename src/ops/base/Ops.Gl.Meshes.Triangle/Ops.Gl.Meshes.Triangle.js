op.name='Triangle';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var sizeW=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var sizeH=op.addInPort(new Port(op,"height",OP_PORT_TYPE_VALUE));

sizeW.set(1);
sizeH.set(1);

var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));
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
    geom.vertices = [
         0.0,           sizeH.get(),  0.0,
        -sizeW.get(),  -sizeH.get(),  0.0,
         sizeW.get(),  -sizeH.get(),  0.0
    ];

    geom.vertexNormals = [
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0
    ];
    
    geom.verticesIndices = [
        0, 1, 2
    ];

    mesh=new CGL.Mesh(cgl,geom);
    geomOut.set(null);
    geomOut.set(geom);

}

sizeW.onValueChange(create);
sizeH.onValueChange(create);

create();