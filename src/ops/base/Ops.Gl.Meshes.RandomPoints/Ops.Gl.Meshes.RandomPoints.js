
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var num=op.addInPort(new CABLES.Port(op,"num"));
var size=op.addInPort(new CABLES.Port(op,"size"),CABLES.OP_PORT_TYPE_VALUE);
var seed=op.addInPort(new CABLES.Port(op,"random seed"));
var scaleX=op.addInPort(new CABLES.Port(op,"scaleX",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleY=op.addInPort(new CABLES.Port(op,"scaleY",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleZ=op.addInPort(new CABLES.Port(op,"scaleZ",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
// var round=op.inValueBool('round',false);

var cgl=op.patch.cgl;

scaleX.set(1);
scaleY.set(1);
scaleZ.set(1);

function doRender()
{
    if(mesh)
    {
        mesh.render(cgl.getShader());
        
        if(CABLES.UI && CABLES.UI.renderHelper)
        {
            CABLES.GL_MARKER.drawCube(op,
                size.get()/2*scaleX.get(),
                size.get()/2*scaleY.get(),
                size.get()/2*scaleZ.get());
        }
    }
}

exe.onTriggered=doRender;

var mesh=null;
var geom=null;

function reset()
{
    geom=new CGL.Geometry();
    var verts=[];
    var n=Math.round(num.get())||1;
    if(n<0)n=1;
    var texCoords=[];
    var vertColors=[];
    verts.length=n*3;
    texCoords.length=n*2;
    vertColors.length=n*3;
    
    Math.randomSeed=seed.get()+0.01;

    var sizeMul=size.get();

    for(var i=0;i<num.get();i++)
    {
        verts[i*3+0]=scaleX.get()*(Math.seededRandom()-0.5)*sizeMul;
        verts[i*3+1]=scaleY.get()*(Math.seededRandom()-0.5)*sizeMul;
        verts[i*3+2]=scaleZ.get()*(Math.seededRandom()-0.5)*sizeMul;
        
        vertColors[i*3+0]=Math.seededRandom();
        vertColors[i*3+1]=Math.seededRandom();
        vertColors[i*3+2]=Math.seededRandom();
        
        texCoords[i*2]=Math.seededRandom();
        texCoords[i*2+1]=Math.seededRandom();
    }
    
    geom.setPointVertices(verts);
    geom.vertColors=vertColors;
    geom.texCoords=texCoords;

    if(mesh)mesh.dispose();
    mesh =new CGL.Mesh(cgl,geom,cgl.gl.POINTS);
    mesh.addVertexNumbers=true;
    mesh.setGeom(geom);
}

size.set(5);
seed.set(0);
seed.onChange=reset;
num.onChange=reset;
size.onChange=reset;
scaleX.onChange=reset;
scaleZ.onChange=reset;
scaleY.onChange=reset;

num.set(1000);
