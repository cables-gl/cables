const render=op.inTrigger("Render");
const inNum=op.inValue("Num",10);
const inSpacing=op.inValue("Spacing",1);
const next=op.outTrigger("Next");

const cgl=op.patch.cgl;
var mesh=null;

inNum.onChange=inSpacing.onChange=function()
{
    if(mesh)mesh.dispose();
    mesh=null;
};

function init()
{
    var geomStepsOne=new CGL.Geometry();
    var geomX=new CGL.Geometry();

    var space=inSpacing.get();
    var num=Math.floor(inNum.get());

    var l=space*num/2;

    var tc=[];

    for(var i=-num/2;i<num/2+1;i++)
    {
        geomStepsOne.vertices.push(-l);
        geomStepsOne.vertices.push(i*space);
        geomStepsOne.vertices.push(0);

        geomStepsOne.vertices.push(l);
        geomStepsOne.vertices.push(i*space);
        geomStepsOne.vertices.push(0);

        geomStepsOne.vertices.push(i*space);
        geomStepsOne.vertices.push(-l);
        geomStepsOne.vertices.push(0);

        geomStepsOne.vertices.push(i*space);
        geomStepsOne.vertices.push(l);
        geomStepsOne.vertices.push(0);

        tc.push(0,0);
        tc.push(0,0);
        tc.push(0,0);
        tc.push(0,0);
    }

    geomStepsOne.setTexCoords(tc);
    geomStepsOne.calculateNormals();

    if(!mesh) mesh=new CGL.Mesh(cgl,geomStepsOne);
        else mesh.setGeom(geomStepsOne);
}


render.onTriggered=function()
{
    if(!mesh)init();
    var shader=cgl.getShader();
    if(!shader)return;

    var oldPrim=shader.glPrimitive;

    shader.glPrimitive=cgl.gl.LINES;

    mesh.render(shader);

    shader.glPrimitive=oldPrim;

    next.trigger();
};

