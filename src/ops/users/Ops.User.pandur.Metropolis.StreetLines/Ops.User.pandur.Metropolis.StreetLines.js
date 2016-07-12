this.name="StreetLines";
var cgl=op.patch.cgl;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var points=this.addInPort(new Port(this,"points",OP_PORT_TYPE_ARRAY));

points.ignoreValueSerialize=true;

var meshes=[];

var cycle=0;
render.onTriggered=function()
{
    if(meshes.length===0)create();
    for(var i=0;i<meshes.length;i++)
    {
        meshes[i].render(cgl.getShader());
    }
    
    trigger.trigger();
};

function createMesh(arr,start,end)
{
    var geom=new CGL.Geometry();
    geom.verticesIndices=[];

    var i=0;
    var texCoords=[];
    var verts=[];
    // verts.length=(end-start)*3*2;
    

    // texCoords.length=(end-start)*2*2;
    
    var lastZ=0;
    for(i=start+1;i<end;i++)
    {
        if(arr[i-1][2]==arr[i][2])
        {
            // if(i==start+10)console.log(arr[i]);

            var coord=window.METROPOLIS.latLonCoord(  arr[i-1][0], arr[i-1][1] );
            var coord2=window.METROPOLIS.latLonCoord( arr[i][0],   arr[i][1] );



            verts.push(coord.lat);
            verts.push(coord.lon);
            verts.push(coord.z);
    
            verts.push(coord2.lat);
            verts.push(coord2.lon);
            verts.push(coord2.z);
            
        }
        lastZ=arr[i][2];
    }

    // geom.verticesIndices.length=verts.length/3;
    // for(i=0;i<verts.length/3;i++) geom.verticesIndices[i]=i;
    // geom.vertices=verts;
    // geom.vertexColors=vertColors;
    // geom.texCoords=texCoords;
    // console.log('geom.verticesIndices',geom.verticesIndices.length);
    // for(var i=0;i<20;i++) console.log(verts[i]);

    geom.setPointVertices(verts);
    // console.log(verts.length/3);

    var mesh =new CGL.Mesh(cgl,geom,cgl.gl.LINES);
    
    // console.log("mesh generated");
    
    return mesh;
}


function create()
{
    if(!window.METROPOLIS || !window.METROPOLIS.elevationLoaded)return;

    console.log('build streetlines,...');
    
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
    
    console.log('build streetlines,...',meshes.length);
    
    
}

create();

points.onValueChange(create);





