const
    render=op.inTrigger("render"),
    radius=op.inValue('radius',0.5),
    innerRadius=op.inValueSlider('innerRadius',0),
    segments=op.inValueInt('segments',40),
    percent=op.inValueSlider('percent',1),
    inDraw=op.inValueBool("Draw",true),
    outNext=op.outTrigger("Next"),
    outGeom=op.outObject("Geometry");

render.onTriggered=doRender;

const cgl=op.patch.cgl;

var mesh=null;
var outerVerts=[],innerVerts=[];
var geom=null;
var verts=null;
var recalcVertsLater=true;
var mulTriangles=1;

innerRadius.onChange=
percent.onChange=
radius.onChange=
    function()
    {
        recalcVertsLater=true;
    };

segments.onChange=function()
{
    mesh=null;
};

function doRender()
{
    if(!mesh)recalcAll();
    if(recalcVertsLater)recalcVerts();

    if(inDraw.get())
    {
        var n=percent.get()*segments.get();
        n=Math.ceil(n)*mulTriangles*3;
        mesh.setNumVertices(n);
        mesh.render(cgl.getShader());
    }

    outNext.trigger();
}


function recalcAll()
{
    mesh=null;
    geom=new CGL.Geometry();
    recalcVerts();

    mesh=new CGL.Mesh(cgl,geom);

    outGeom.set(null);
    outGeom.set(geom);
}

function recalcVerts()
{
    if(!geom)recalcAll();

    var inner=innerRadius.get()!=0;
    var numSegs=Math.max(0,segments.get());
    mulTriangles=1;
    if(inner)mulTriangles=2;
    var numTriangles=numSegs*mulTriangles;

    calcCircle(outerVerts,radius.get(),numSegs,1);
    calcCircle(innerVerts,innerRadius.get(),numSegs,1);

    if(!verts || verts.length!=numTriangles*9*mulTriangles)
        verts=new Float32Array(numTriangles*9*mulTriangles);

    var i,ind=0;
    for(i=0;i<outerVerts.length-3;i+=3)
    {
        ind=i/3*9*mulTriangles;
        verts[ind+0]=outerVerts[i+0];
        verts[ind+1]=outerVerts[i+1];
        verts[ind+2]=outerVerts[i+2];

        verts[ind+3]=outerVerts[i+3];
        verts[ind+4]=outerVerts[i+4];
        verts[ind+5]=outerVerts[i+5];

        verts[ind+6]=innerVerts[i+0];
        verts[ind+7]=innerVerts[i+1];
        verts[ind+8]=innerVerts[i+2];

        if(inner)
        {
            verts[ind+9]=outerVerts[i+3];
            verts[ind+10]=outerVerts[i+4];
            verts[ind+11]=outerVerts[i+5];

            verts[ind+12]=innerVerts[i+0];
            verts[ind+13]=innerVerts[i+1];
            verts[ind+14]=innerVerts[i+2];

            verts[ind+15]=innerVerts[i+3];
            verts[ind+16]=innerVerts[i+4];
            verts[ind+17]=innerVerts[i+5];
        }
    }

    ind=i/3*9*mulTriangles;
    verts[ind+0]=outerVerts[i+0];
    verts[ind+1]=outerVerts[i+1];
    verts[ind+2]=outerVerts[i+2];

    verts[ind+3]=outerVerts[0];
    verts[ind+4]=outerVerts[1];
    verts[ind+5]=outerVerts[2];

    verts[ind+6]=innerVerts[i+0];
    verts[ind+7]=innerVerts[i+1];
    verts[ind+8]=innerVerts[i+2];

    if(inner)
    {
        verts[ind+9]=outerVerts[0];
        verts[ind+10]=outerVerts[1];
        verts[ind+11]=outerVerts[2];

        verts[ind+12]=innerVerts[i+0];
        verts[ind+13]=innerVerts[i+1];
        verts[ind+14]=innerVerts[i+2];

        verts[ind+15]=innerVerts[0];
        verts[ind+16]=innerVerts[1];
        verts[ind+17]=innerVerts[2];
    }


    geom.vertices=verts;
    if(mesh)mesh.updateVertices(geom);
    recalcVertsLater=false;

    return verts;
}



function calcCircle(outArray,radius,segments,perc)
{
    outArray.length=segments*3;

    if(radius==0)
    {
           for (let i=0;i<segments*3;i++)outArray[i]=0;
           return;
     }

    var count=0;
    for (let i=0;i<segments;i++)
    {
        var degInRad = (360-(perc*360/segments*i)+90)*CGL.DEG2RAD;
        var posx=Math.cos(degInRad)*radius;
        var posy=Math.sin(degInRad)*radius;

        outArray[i*3+0]=posx;
        outArray[i*3+1]=posy;
        outArray[i*3+2]=0;
    }
}



op.onDelete=function()
{
    if(mesh)mesh.dispose();
};