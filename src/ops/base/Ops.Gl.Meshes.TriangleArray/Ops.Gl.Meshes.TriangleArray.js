op.name="TriangleArray";

var render=op.inFunction("Render");
var inArr=op.inArray("Points");
var next=op.outFunction("Next");
var geomOut=op.outObject("Geometry");

var geom=new CGL.Geometry("triangle array");

var mesh=null;

var cgl=op.patch.cgl;

inArr.onChange=function()
{
    var verts=inArr.get();
    geom.vertices = verts;

    mesh=new CGL.Mesh(cgl,geom);
    geomOut.set(null);
    geomOut.set(geom);
};

render.onTriggered=function()
{
    if(mesh)mesh.render(cgl.getShader());
    next.trigger();
};