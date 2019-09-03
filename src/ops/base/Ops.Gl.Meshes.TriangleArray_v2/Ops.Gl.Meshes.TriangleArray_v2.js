const
    render=op.inTrigger("Render"),
    inArr=op.inArray("Points"),
    next=op.outTrigger("Next"),
    geomOut=op.outObject("Geometry"),
    geom=new CGL.Geometry("triangle array");

var mesh=null;
var verts=null;
const cgl=op.patch.cgl;

op.toWorkPortsNeedToBeLinked(inArr,render);

inArr.onChange=function()
{
    verts=inArr.get();
    if(!verts)return;

    if(verts && mesh && geom.vertices.length==verts.length)
    {
        var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,verts,3);
        attr.numItems=verts.length/3;
        return;
    }

    geom.vertices = verts;
    geom.calculateNormals();

    mesh=new CGL.Mesh(cgl,geom);
    geomOut.set(null);
    geomOut.set(geom);
};

render.onTriggered=function()
{
    if(mesh && verts)mesh.render(cgl.getShader());
    next.trigger();
};