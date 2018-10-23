this.name='particletest';
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var num=this.addInPort(new Port(this,"count",CABLES.OP_PORT_TYPE_VALUE));
num.set(100000);

var mesh=null;

render.onTriggered=function()
{
    mesh.render(cgl.getShader());
};


function create()
{
    var geom=new CGL.Geometry();
    geom.verticesIndices=[];

    console.log('creating '+num.get()+' points')
    
    var verts=[];
    var n=num.get()*3;
    verts.length=n;
    for(var i=0;i<n;i++)
    {
        verts[i]=0;
    }
    
    geom.vertices=verts;

console.log(geom);

    if(!mesh)mesh =new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);
}

create();

num.onValueChange(create);





