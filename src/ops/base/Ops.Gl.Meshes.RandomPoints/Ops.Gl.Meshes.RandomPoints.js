op.name="Random Points";

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var num=op.addInPort(new Port(op,"num"));
var size=op.addInPort(new Port(op,"size"));
var seed=op.addInPort(new Port(op,"random seed"));
var scaleX=op.addInPort(new Port(op,"scaleX",OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleY=op.addInPort(new Port(op,"scaleY",OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleZ=op.addInPort(new Port(op,"scaleZ",OP_PORT_TYPE_VALUE,{ display:'range' }));

var cgl=op.patch.cgl;

scaleX.set(1);
scaleY.set(1);
scaleZ.set(1);

function doRender()
{
    if(mesh) mesh.render(cgl.getShader());
}

exe.onTriggered=doRender;

var mesh=null;
var geom=null;

function reset()
{
    geom=new CGL.Geometry();
    var verts=[];
    verts.length=Math.round(num.get())*3;
    Math.randomSeed=seed.get();

    for(var i=0;i<num.get();i++)
    {
        verts[i*3+0]=scaleX.get()*(Math.seededRandom()-0.5)*size.get();
        verts[i*3+1]=scaleY.get()*(Math.seededRandom()-0.5)*size.get();
        verts[i*3+2]=scaleZ.get()*(Math.seededRandom()-0.5)*size.get();
    }
    geom.setPointVertices(verts);

    mesh =new CGL.Mesh(cgl,geom,cgl.gl.POINTS);
}

size.set(40);
seed.set(0);
seed.onValueChange(reset);
num.onValueChange(reset);
size.onValueChange(reset);
scaleX.onValueChange(reset);
scaleZ.onValueChange(reset);
scaleY.onValueChange(reset);

num.set(1000);
