
var render=op.inTrigger('Render');
var width=op.addInPort(new CABLES.Port(op,"Width",CABLES.OP_PORT_TYPE_VALUE));
var height=op.addInPort(new CABLES.Port(op,"Height",CABLES.OP_PORT_TYPE_VALUE));
var thickness=op.addInPort(new CABLES.Port(op,"Thickness",CABLES.OP_PORT_TYPE_VALUE));
var pivotX=op.addInPort(new CABLES.Port(op,"pivot x",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","left","right"]} ));
var pivotY=op.addInPort(new CABLES.Port(op,"pivot y",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","top","bottom"]} ));

var trigger=op.outTrigger('trigger');
var geomOut=op.addOutPort(new CABLES.Port(op,"Geometry",CABLES.OP_PORT_TYPE_OBJECT));



var cgl=op.patch.cgl;
var mesh=null;
var geom=new CGL.Geometry();
geom.tangents=[];
geom.biTangents=[];

width.set(1);
height.set(1);
thickness.set(-0.1);
pivotX.set('center');
pivotY.set('center');

geomOut.ignoreValueSerialize=true;

width.onChange=create;
pivotX.onChange=create;
pivotY.onChange=create;
height.onChange=create;
thickness.onChange=create;


create();

render.onTriggered=function()
{
    mesh.render(cgl.getShader());
    trigger.trigger();
};


function create()
{
    var w=width.get();
    var h=height.get();
    var x=-w/2;
    var y=-h/2;
    var th=thickness.get();
 
    var pivot = pivotX.get();
    if(pivot=='right') x=-w;
    else if(pivot=='left') x=0;

    pivot = pivotY.get();
    if(pivot=='top') y=-w;
    else if(pivot=='bottom') y=0;

    geom.vertices.length=0;
    geom.vertices.push(
        x, y, 0,
        x+w, y, 0,
        x+w, y+h, 0,
        x, y+h, 0,
        x-th, y, 0,
        x+w+th, y-th, 0,
        x+w, y+h+th, 0,
        x-th, y+h+th, 0
    );

    if(geom.vertexNormals.length===0)
        geom.vertexNormals.push(0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1);
    if(geom.tangents.length===0)
        geom.tangents.push(1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0);
    if(geom.biTangents.length===0)
        geom.biTangents.push(0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0);


    if(geom.verticesIndices)geom.verticesIndices.length=0;
    else geom.verticesIndices = [];

    geom.verticesIndices.push( 7, 6, 3,  6, 2, 3);
    geom.verticesIndices.push( 0, 4, 3,  4, 7, 3);


    if(geom.texCoords.length===0)
    {
        geom.texCoords=new Float32Array();
        for(var i=0;i<geom.vertices.length;i+=3)
        {
            geom.texCoords[i/3*2]=geom.vertices[i+0]/w-0.5;
            geom.texCoords[i/3*2]=geom.vertices[i+1]/h-0.5;
        }
    }

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
    else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);
}

