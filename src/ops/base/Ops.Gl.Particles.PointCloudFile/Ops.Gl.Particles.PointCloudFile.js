this.name="PointCloudFile";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var points=this.addInPort(new Port(this,"points",OP_PORT_TYPE_ARRAY));

points.ignoreValueSerialize=true;

var mesh=null;

render.onTriggered=function()
{
    if(mesh)mesh.render(cgl.getShader());
    
    trigger.trigger();
};


function create()
{
    var arr=points.get();
    if(arr)
    {
        var geom=new CGL.Geometry();
        geom.verticesIndices=[];

        console.log('points ',arr.length);
        var i=0;
        var verts=[];
        verts.length=arr.length*3;
        geom.verticesIndices.length=arr.length;
        
        for(i=0;i<arr.length;i++)
        {
            verts[i*3+0]=arr[i][0];
            verts[i*3+1]=arr[i][1];
            verts[i*3+2]=arr[i][2];
        }

        for(i=0;i<verts.length/3;i++) geom.verticesIndices[i]=i;
        
        geom.vertices=verts;
        
        // console.log(verts.length);
    
        if(!mesh)mesh =new CGL.Mesh(cgl,geom);
            else mesh.setGeom(geom);

    }
    
    
}

create();

points.onValueChange(create);





