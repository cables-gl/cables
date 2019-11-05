const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");
const points=op.inArray("points");
const doCenter=op.inValueBool("center");
const doRender=op.inValueBool("Render",true);

const outPoints=op.outArray("Points");
const outVertColors=op.outArray("Vertex Colors");


const cgl=this.patch.cgl;

points.ignoreValueSerialize=true;

var meshes=[];

doCenter.onChange=create;

var cycle=0;
render.onTriggered=function()
{
    if(doRender.get())
    {
        for(var i=0;i<meshes.length;i++)
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

    outPoints.set(verts);
    outVertColors.set(vertColors);

    geom.vertices=verts;
    geom.vertexColors=vertColors;
    geom.texCoords=texCoords;
    console.log('geom.verticesIndices',geom.verticesIndices.length);

    var mesh =new CGL.Mesh(cgl,geom,cgl.gl.POINTS);

    console.log("mesh generated");

    return mesh;
}


function create()
{


    var arr=points.get();
    if(!arr)return;
    meshes.length=0;
    var meshMax=20000000;
    var i=0;

    if(doCenter.get())
    {
        var avgX=0;
        var avgY=0;
        var avgZ=0;

        for(i=0;i<arr.length;i++)
        {
            avgX=(avgX+arr[i][0])/2;
            avgY=(avgY+arr[i][1])/2;
            avgZ=(avgZ+arr[i][2])/2;
        }

        for(i=0;i<arr.length;i++)
        {
            arr[i][0]-=avgX;
            arr[i][1]-=avgY;
            arr[i][2]-=avgZ;
        }

    }

    if(arr)
    {
        var count=0;
        for(i=0;i<arr.length;i+=meshMax)
        {
            meshes.push(createMesh(arr,i,Math.min(arr.length,i+meshMax)));
        }
    }


}

create();

points.onValueChange(create);





