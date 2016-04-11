this.name="PointCloudFile";
var cgl=this.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var points=this.addInPort(new Port(this,"points",OP_PORT_TYPE_ARRAY));

points.ignoreValueSerialize=true;

var meshes=[];

var cycle=0;
render.onTriggered=function()
{
    for(var i=0;i<meshes.length;i++)
        meshes[i].render(cgl.getShader());
    
    trigger.trigger();
};

function createMesh(arr,start,end)
{
    var geom=new CGL.Geometry();
    geom.verticesIndices=[];

    var i=0;
    var texCoords=[];
    var verts=[];
    verts.length=(end-start)*3;
    
    var vertColors=[];
    vertColors.length=(end-start)*4;
    texCoords.length=(end-start)*2;
    geom.verticesIndices.length=end-start;
    
    for(i=start;i<end;i++)
    {
        var ind=i-start;
        verts[ind*3+0]=arr[i][0];
        verts[ind*3+1]=arr[i][1];
        verts[ind*3+2]=arr[i][2];
        
        vertColors[ind*4+0]=arr[i][3]/255;
        vertColors[ind*4+1]=arr[i][4]/255;
        vertColors[ind*4+2]=arr[i][5]/255;
        vertColors[ind*4+3]=1;
        
        texCoords[ind*2+0]=5/(arr[i][1]%5);
        texCoords[ind*2+1]=5/(arr[i][2]%5);
    }

    for(i=0;i<verts.length/3;i++) geom.verticesIndices[i]=i;

    geom.vertices=verts;
    geom.vertexColors=vertColors;
    geom.texCoords=texCoords;
    console.log('geom.verticesIndices',geom.verticesIndices.length);

    var mesh =new CGL.Mesh(cgl,geom,cgl.gl.POINTS);
    
    return mesh;
}


function create()
{
    meshes.length=0;
    var arr=points.get();
    var meshMax=2000;
    if(arr)
    {
        var count=0;
        for(var i=0;i<arr.length;i+=meshMax)
        {
            meshes.push(createMesh(arr,i,Math.min(arr.length,i+meshMax)));
        }
    }
    
    
}

create();

points.onValueChange(create);





