const render=op.inFunction("Render");
const inNum=op.inValue("Num",10);
const inSpacing=op.inValue("Spacing",1);
const next=op.outFunction("Next");

const cgl=op.patch.cgl;
var mesh=null;

inNum.onChange=inSpacing.onChange=function()
{
    if(mesh)mesh.dispose();
    mesh=null;
};

function init()
{
    var geomVertical=new CGL.Geometry();

    var space=inSpacing.get();
    var num=Math.floor(inNum.get());

    var l=space*num/2;

    var tc=[];

    for(var i=-num/2;i<num/2+1;i++)
    {
        geomVertical.vertices.push(-l);
        geomVertical.vertices.push(i*space);
        geomVertical.vertices.push(0);

        geomVertical.vertices.push(l);
        geomVertical.vertices.push(i*space);
        geomVertical.vertices.push(0);

        geomVertical.vertices.push(i*space);
        geomVertical.vertices.push(-l);
        geomVertical.vertices.push(0);

        geomVertical.vertices.push(i*space);
        geomVertical.vertices.push(l);
        geomVertical.vertices.push(0);
        
        tc.push(0,0);
        tc.push(0,0);
        tc.push(0,0);
        tc.push(0,0);
    }
    
    geomVertical.setTexCoords(tc);
    geomVertical.calculateNormals();

    if(!mesh) mesh=new CGL.Mesh(cgl,geomVertical);
        else mesh.setGeom(geomVertical);
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

