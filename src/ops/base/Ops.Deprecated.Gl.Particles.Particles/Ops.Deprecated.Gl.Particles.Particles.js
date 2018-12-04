this.name='particles';
var cgl=this.patch.cgl;

const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");
var num=this.addInPort(new CABLES.Port(this,"count",CABLES.OP_PORT_TYPE_VALUE));
num.set(100000);

var mesh=null;

render.onTriggered=function()
{
    mesh.render(cgl.getShader());
    
    trigger.trigger();
};


function create()
{
    var i=0;
    var verts=[];
    var n=num.get()*3;

    var geom=new CGL.Geometry();
    geom.verticesIndices=[];

    verts.length=n;
    for(i=0;i<n;i++) verts[i]=0;
    for(i=0;i<verts.length/3;i++) geom.verticesIndices.push(i);
    
    geom.vertices=verts;
    
    console.log(verts.length);

    if(!mesh)mesh =new CGL.Mesh(cgl,geom);
    mesh.addVertexNumbers=true;    
    mesh.setGeom(geom);
    
}

create();

num.onValueChange(create);





