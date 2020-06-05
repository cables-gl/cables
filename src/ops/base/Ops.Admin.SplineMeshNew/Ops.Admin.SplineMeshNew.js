const
    render=op.inTrigger("Render"),
    inPoints=op.inArray("Points"),
    inHardEdges=op.inBool("Tesselate Edges",false),
    inRenderMesh=op.inBool("Render Mesh",true),
    next=op.outTrigger("Next");

let geom=new CGL.Geometry('splinemesh2');
geom.vertices=[];
geom.clear();

let thePoints=[];
const cgl=op.patch.cgl;
let points=[];
let points2=[];
let points3=[];

const verts=[0,0,0];

let mesh=new CGL.Mesh(cgl,geom);
mesh.addVertexNumbers=true;

inHardEdges.onChange=
inPoints.onChange=rebuild;

render.onTriggered=renderMesh;

function renderMesh()
{
    if(mesh && inRenderMesh.get()) mesh.render(cgl.getShader());
}

function buildMesh()
{
    verts.length=0;

    const max=1;
    const min=-max;

    for(let i=0;i<thePoints.length/3;i++)
    {
        verts.push(
            max ,min,0,   0,min,0   ,max,max,0,
            0   ,min,0,   0,max,0   ,max,max,0
            );
    }
    geom.vertices=verts;

    if(mesh)mesh.dispose();
    mesh=new CGL.Mesh(cgl,geom);
}

function rebuild()
{
    let inpoints=inPoints.get();
    if(!inpoints)
    {
        mesh=null;
        return;
    }

    thePoints=inpoints;

    if(inHardEdges.get()) thePoints=tessEdges(inPoints.get());

    points.length=points2.length=thePoints.length*6;

    let count=0;

    for(let i=0;i<thePoints.length/3;i++)
        for(let j=0;j<6;j++)
            for(let k=0;k<3;k++)
            {
                points[count]=thePoints[(Math.max(0,i-1))*3+k];
                points2[count]=thePoints[(i+0)*3+k];
                points3[count]=thePoints[(i+1)*3+k];
                count++;
            }

    buildMesh();

    mesh.setAttribute("spline",points,3);
    mesh.setAttribute("spline2",points2,3);
    mesh.setAttribute("spline3",points3,3);
}

function ip(a,b,p)
{
    return a+((b-a)*p);
}

function tessEdges(oldArr)
{
    let count=0;
    let arr=[];

    const step=0.001;
    const oneMinusStep=1-step;

    for(let i=0;i<oldArr.length-3;i+=3)
    {
        arr[count++]=oldArr[i+0];
        arr[count++]=oldArr[i+1];
        arr[count++]=oldArr[i+2];

        arr[count++]=ip(oldArr[i+0],oldArr[i+3],step);
        arr[count++]=ip(oldArr[i+1],oldArr[i+4],step);
        arr[count++]=ip(oldArr[i+2],oldArr[i+5],step);

        arr[count++]=ip(oldArr[i+0],oldArr[i+3],oneMinusStep);
        arr[count++]=ip(oldArr[i+1],oldArr[i+4],oneMinusStep);
        arr[count++]=ip(oldArr[i+2],oldArr[i+5],oneMinusStep);
    }
    return arr;
}