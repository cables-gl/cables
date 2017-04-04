op.name="SimpleSpline";

var render=op.inFunction("Render");

var inPoints=op.inArray("Points");
var strip=op.inValueBool("Line Strip",true);
var numPoints=op.inValue("Num Points");



var next=op.outFunction("Next");

var cgl=op.patch.cgl;

var geom=new CGL.Geometry("simplespline");
geom.vertices=[0,0,0,0,0,0,0,0,0];
var mesh=new CGL.Mesh(cgl,geom);


var buff=new Float32Array();

render.onTriggered=function()
{
    var points=inPoints.get();

    if(!points)return;
    if(points.length===0)return;
    
    if(op.instanced(render))return;


    if(!(points instanceof Float32Array))
    {
        if(points.length!=buff.length)
        {
            // console.log("Resize...");
            buff=new Float32Array(points.length);
            buff.set(points);
        }
        else
        {
            buff.set(points);
        }
    }
    else
    {
        buff=points;
    }
    
    var shader=cgl.getShader();

    var oldPrim=shader.glPrimitive;
    if(strip.get())shader.glPrimitive=cgl.gl.LINE_STRIP;
        else shader.glPrimitive=cgl.gl.LINES;
    var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,buff,3);
    
    if(numPoints.get()<=0)attr.numItems=buff.length/3;
        else attr.numItems=Math.min(numPoints.get(),buff.length/3);

    
    mesh.render(shader);
    
    shader.glPrimitive=oldPrim;
    
    
    next.trigger();
    
};