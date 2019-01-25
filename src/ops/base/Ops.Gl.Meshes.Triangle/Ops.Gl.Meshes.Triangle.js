const
    render=op.inTrigger('render'),
    trigger=op.outTrigger('trigger'),
    sizeW=op.inValueFloat("width",1),
    sizeH=op.inValueFloat("height",1),
    draw=op.inValueBool("Draw",true),
    geom=new CGL.Geometry("triangle"),
    geomOut=op.outObject("geometry");

geomOut.ignoreValueSerialize=true;

op.setPortGroup("Size",[sizeW,sizeH]);

const cgl=op.patch.cgl;
var mesh=null;
sizeW.onChange=create;
sizeH.onChange=create;

create();

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
    geom.tangents = [
        1,0,0,
        1,0,0,
        1,0,0
    ];
    geom.biTangents = [
        0,1,0,
        0,1,0,
        0,1,0
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

