op.name="SimpleSpline";

var render=op.inFunction("Render");

var points=op.inArray("Points");

var next=op.outFunction("Next");

var cgl=op.patch.cgl;

var geom=new CGL.Geometry("simplespline");
geom.vertices=[0,0,0,0,0,0,0,0,0];
var mesh=new CGL.Mesh(cgl,geom);


var buff=new Float32Array();

render.onTriggered=function()
{
    if(!points.get())return;
    if(points.get().length===0)return;
    if(op.instanced(render))return;

    if(points.get().length===0)return;

    if(points.get().length!=buff.length)
    {
        // console.log("Resize...");
        buff=new Float32Array(points.get());
    }
    else
    {
        buff.set(points.get());
    }
    
    var shader=cgl.getShader();
    
    var oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.LINE_STRIP;
    mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,buff,3);
    
    mesh.render(shader);
    
    shader.glPrimitive=oldPrim;
    
    
    next.trigger();
    
};