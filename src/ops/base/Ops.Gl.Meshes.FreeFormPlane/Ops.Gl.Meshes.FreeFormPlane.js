op.name="FreeFormPlane";

var render=op.inFunction("render");
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var x1=op.inValue("x 1",-1);
var y1=op.inValue("y 1",1);
var z1=op.inValue("z 1",0);

var x2=op.inValue("x 2",1);
var y2=op.inValue("y 2",1);
var z2=op.inValue("z 2",0);

var x3=op.inValue("x 3",-1);
var y3=op.inValue("y 3",-1);
var z3=op.inValue("z 3",0);

var x4=op.inValue("x 4",1);
var y4=op.inValue("y 4",-1);
var z4=op.inValue("z 4",0);


var tcx1=op.inValue("tc x 1",0);
var tcy1=op.inValue("tc y 1",1);

var tcx2=op.inValue("tc x 2",1);
var tcy2=op.inValue("tc y 2",1);

var tcx3=op.inValue("tc x 3",0);
var tcy3=op.inValue("tc y 3",0);

var tcx4=op.inValue("tc x 4",1);
var tcy4=op.inValue("tc y 4",0);



var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;

tcx1.onChange=rebuild;
tcy1.onChange=rebuild;

tcx2.onChange=rebuild;
tcy2.onChange=rebuild;

tcx3.onChange=rebuild;
tcy3.onChange=rebuild;

tcx4.onChange=rebuild;
tcy4.onChange=rebuild;

x1.onChange=rebuild;
x2.onChange=rebuild;
x3.onChange=rebuild;
x4.onChange=rebuild;

y1.onChange=rebuild;
y2.onChange=rebuild;
y3.onChange=rebuild;
y4.onChange=rebuild;

z1.onChange=rebuild;
z2.onChange=rebuild;
z3.onChange=rebuild;
z4.onChange=rebuild;


// axis.set('xy');
// pivotX.set('center');
// pivotY.set('center');

var geom=new CGL.Geometry();
var mesh=null;

rebuild();

render.onTriggered=function()
{
    mesh.render(cgl.getShader());
    trigger.trigger();
};

function rebuild()
{
    // var w=width.get();
    // var h=height.get();
    // var x=0;
    // var y=0;
    
    // if(typeof w=='string')w=parseFloat(w);
    // if(typeof h=='string')h=parseFloat(h);
    
    // if(pivotX.get()=='center') x=0;
    // if(pivotX.get()=='right') x=-w/2;
    // if(pivotX.get()=='left') x=+w/2;

    // if(pivotY.get()=='center') y=0;
    // if(pivotY.get()=='top') y=-h/2;
    // if(pivotY.get()=='bottom') y=+h/2;

    // var verts=[];
    // var tc=[];
    // var norms=[];
    // var indices=[];

    // var numRows=Math.round(nRows.get());
    // var numColumns=Math.round(nColumns.get());

    // var stepColumn=w/numColumns;
    // var stepRow=h/numRows;

    // var c,r;

    var verts=[];
    verts.push(x1.get());
    verts.push(y1.get());
    verts.push(z1.get());

    verts.push(x2.get());
    verts.push(y2.get());
    verts.push(z2.get());

    verts.push(x3.get());
    verts.push(y3.get());
    verts.push(z3.get());

    verts.push(x4.get());
    verts.push(y4.get());
    verts.push(z4.get());


    var indices=[0,1,2,1,2,3];
    // var tc=[0,0, 1,0, 0,1,  1,1];
    var tc=[
        tcx1.get(),
        tcy1.get(),
        
        tcx2.get(),
        tcy2.get(),
        
        tcx3.get(),
        tcy3.get(),
        
        tcx4.get(),
        tcy4.get(),
        ];

    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    // geom.vertexNormals=norms;
    geom.calculateNormals({"forceZUp":true});

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);

}
