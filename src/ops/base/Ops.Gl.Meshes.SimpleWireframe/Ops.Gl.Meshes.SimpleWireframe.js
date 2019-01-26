const
    render=op.inTrigger("Render"),
    inGeom=op.inObject("Geometry"),
    next=op.outTrigger("Next")
    ;

const cgl=op.patch.cgl;

render.onTriggered=doRender;

var mesh=null;
var verts=[];

inGeom.onChange=function()
{
    var geom=inGeom.get();
    if(!geom)return;

    verts.length=0;

    for(var i=0;i<geom.verticesIndices.length;i+=3)
    {
        var index=geom.verticesIndices[i+0];
        var index1=geom.verticesIndices[i+1];
        var index2=geom.verticesIndices[i+2];

        verts.push(geom.vertices[index*3+0],geom.vertices[index*3+1],geom.vertices[index*3+2]);
        verts.push(geom.vertices[index1*3+0],geom.vertices[index1*3+1],geom.vertices[index1*3+2]);
        verts.push(geom.vertices[index1*3+0],geom.vertices[index1*3+1],geom.vertices[index1*3+2]);
        verts.push(geom.vertices[index2*3+0],geom.vertices[index2*3+1],geom.vertices[index2*3+2]);
        verts.push(geom.vertices[index2*3+0],geom.vertices[index2*3+1],geom.vertices[index2*3+2]);
        verts.push(geom.vertices[index*3+0],geom.vertices[index*3+1],geom.vertices[index*3+2]);
    }

    geom=new CGL.Geometry("wireframelinegeom");
    geom.setPointVertices(verts);

    mesh=new CGL.Mesh(cgl,geom,cgl.gl.LINE_STRIP);
};


function doRender()
{
    var shader=cgl.getShader();
    if(!shader)return;

    var oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.LINE_STRIP;
    if(mesh) mesh.render(shader);
    shader.glPrimitive=oldPrim;
    next.trigger();
}