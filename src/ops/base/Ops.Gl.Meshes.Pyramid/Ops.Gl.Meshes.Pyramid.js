op.name="Pyramid";

var render=op.inFunction("Render");

var sizeW=op.inValue("Width",1);
var sizeL=op.inValue("Length",1);
var sizeH=op.inValue("Height",2);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var geomOut=op.outObject("geometry");

var geom=null;
var cgl=op.patch.cgl;
var mesh=null;

sizeW.onChange=create;
sizeH.onChange=create;
sizeL.onChange=create;

create();

render.onTriggered=function()
{
    mesh.render(cgl.getShader());
    trigger.trigger();
};


function create()
{
    if(!geom)geom=new CGL.Geometry();
    var w=sizeW.get();
    var h=sizeH.get();
    var l=sizeL.get();
    
    geom.vertices = [
        -w,-l,0,
        w,-l,0,
        w,l,0,
        -w,l,0,
        0,0,h,
    ];

    geom.vertexNormals = [
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0
    ];

    geom.texCoords = [
         0.5,  0.0,
         1.0,  1.0,
         0.0,  1.0,
         0.0,  1.0,
         0.0,  1.0,
    ];

    geom.verticesIndices = [
        0, 1, 2,
        0,2, 3,
        
        0,1, 4,
        2,3, 4,
        0,3, 4,
        1,2, 4,
        
    ];


geom.unIndex();
    geom.calculateNormals({forceZUp:false});
    

    mesh=new CGL.Mesh(cgl,geom);
    geomOut.set(null);
    geomOut.set(geom);

}
