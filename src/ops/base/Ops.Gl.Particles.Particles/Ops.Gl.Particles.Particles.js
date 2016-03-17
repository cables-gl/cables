this.name='particles';
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var num=this.addInPort(new Port(this,"count",OP_PORT_TYPE_VALUE));
num.set(100000);

var mesh=null;

render.onTriggered=function()
{
    mesh.render(cgl.getShader());
    
    trigger.trigger();
};


function create()
{
    var geom=new CGL.Geometry();
    geom.verticesIndices=[];
    
    var verts=[];
    var n=num.get()*3;
    verts.length=n;
    for(var i=0;i<n;i++)
    {
        verts[i]=0;
    }
    
    for(var i=0;i<verts.length/3;i++) geom.verticesIndices.push(i);
    
    geom.vertices=verts;
    
    console.log(verts.length);

    if(!mesh)mesh =new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);
    
}

create();

num.onValueChange(create);





