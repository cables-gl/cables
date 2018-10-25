var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var sizeW=op.addInPort(new CABLES.Port(op,"width",CABLES.OP_PORT_TYPE_VALUE));
var sizeH=op.addInPort(new CABLES.Port(op,"height",CABLES.OP_PORT_TYPE_VALUE));
const draw=op.inValueBool("Draw",true);
var geom=new CGL.Geometry("triangle");

sizeW.set(1);
sizeH.set(1);

var geomOut=op.addOutPort(new CABLES.Port(op,"geometry",CABLES.OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var mesh=null;

render.onTriggered=function()
{
    if(draw.get())mesh.render(cgl.getShader());
    trigger.trigger();
};

function create()
{
    geom.vertices = [
         0.0,           sizeH.get(),  0.0,
        -sizeW.get(),  -sizeH.get(),  0.0,
         sizeW.get(),  -sizeH.get(),  0.0
    ];

    geom.vertexNormals = [
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0
    ];

    geom.texCoords = [
         0.5,  0.0,
         1.0,  1.0,
         0.0,  1.0,
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