op.name='RectangleFrame';

var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));
var width=op.addInPort(new Port(op,"Width",OP_PORT_TYPE_VALUE));
var height=op.addInPort(new Port(op,"Height",OP_PORT_TYPE_VALUE));
var thickness=op.addInPort(new Port(op,"Thickness",OP_PORT_TYPE_VALUE));
var pivotX=op.addInPort(new Port(op,"pivot x",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","left","right"]} ));
var pivotY=op.addInPort(new Port(op,"pivot y",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","top","bottom"]} ));

var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));
var geomOut=op.addOutPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));


var cgl=op.patch.cgl;
var mesh=null;
var geom=new CGL.Geometry();

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
    var th=thickness.get();//*Math.min(height.get(),width.get())*-0.5;
 
    if(pivotX.get()=='right') x=-w;
    if(pivotX.get()=='left') x=0;

    if(pivotY.get()=='top') y=-w;
    if(pivotY.get()=='bottom') y=0;

    if(geom.vertices.length!=8*3) geom.vertices.length=8*3;

    var c=0;
    geom.vertices[c++]=x;
    geom.vertices[c++]=y;
    geom.vertices[c++]=0;

    geom.vertices[c++]=x+w;
    geom.vertices[c++]=y;
    geom.vertices[c++]=0;

    geom.vertices[c++]=x+w;
    geom.vertices[c++]=y+h;
    geom.vertices[c++]=0;

    geom.vertices[c++]=x;
    geom.vertices[c++]=y+h;
    geom.vertices[c++]=0;

    geom.vertices[c++]=x-th; 
    geom.vertices[c++]=y-th;
    geom.vertices[c++]=0;

    geom.vertices[c++]=x+w+th;
    geom.vertices[c++]=y-th;
    geom.vertices[c++]=0;

    geom.vertices[c++]=x+w+th;
    geom.vertices[c++]=y+h+th;
    geom.vertices[c++]=0;

    geom.vertices[c++]=x-th;
    geom.vertices[c++]=y+h+th;
    geom.vertices[c++]=0;

    if(geom.vertexNormals.length===0)
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
        
    if(geom.verticesIndices.length===0)
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

    if(geom.texCoords.length===0)
    {
        geom.texCoords=new Float32Array();
        for(var i=0;i<geom.vertices.length;i+=3)
        {
            geom.texCoords[i/3*2]=geom.vertices[i+0]/width.get()-0.5;
            geom.texCoords[i/3*2]=geom.vertices[i+1]/height.get()-0.5;
        }
    }

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);
}

