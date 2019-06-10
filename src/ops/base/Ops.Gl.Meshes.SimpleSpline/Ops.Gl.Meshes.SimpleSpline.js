const
    render=op.inTrigger("Render"),
    inPoints=op.inArray("Points"),
    strip=op.inValueBool("Line Strip",true),
    numPoints=op.inValueInt("Num Points"),
    next=op.outTrigger("Next");

const cgl=op.patch.cgl;
const geom=new CGL.Geometry("simplespline");

geom.vertices=[0,0,0,0,0,0,0,0,0];
var mesh=new CGL.Mesh(cgl,geom);
var buff=new Float32Array();
var needsRebuild=true;

inPoints.onChange=function(){//rebuild;
        needsRebuild=true;
    };

var attr;

op.toWorkPortsNeedToBeLinked(inPoints);

function rebuild()
{
    var points=inPoints.get();

    if(!points)return;

    if(points.length===0)return;
    // if(op.instanced(render))return;

    if(!(points instanceof Float32Array))
    {
        if(points.length!=buff.length)
        {
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

    attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,buff,3);

    var numTc=(points.length/3)*2;
    if(mesh.getAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD).numItems!=numTc/2)
    {
        var bufTexCoord=new Float32Array(numTc);
        var attrTc=mesh.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD,bufTexCoord,2);
    }
}

render.onTriggered=function()
{
    if(!inPoints.get())return;
    if(needsRebuild)rebuild();
    var shader=cgl.getShader();
    if(!shader)return;

    var oldPrim=shader.glPrimitive;
    if(strip.get())shader.glPrimitive=cgl.gl.LINE_STRIP;
        else shader.glPrimitive=cgl.gl.LINES;

    if(attr)
        if(numPoints.get()<=0)attr.numItems=buff.length/3;
            else attr.numItems=Math.min(numPoints.get(),buff.length/3);

    if(mesh) mesh.render(shader);

    shader.glPrimitive=oldPrim;

    next.trigger();
};