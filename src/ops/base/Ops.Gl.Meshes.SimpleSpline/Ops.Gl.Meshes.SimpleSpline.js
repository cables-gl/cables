const
    render=op.inTrigger("Render"),
    inPoints=op.inArray("Points"),
    numPoints=op.inValueInt("Num Points"),
    strip=op.inBool("Line Strip",true),
    outGeom=op.outObject("Geometry"),
    // a=op.inSwitch("Mode",["Line Strip","Line Loop","Lines"]),
    next=op.outTrigger("Next");

const cgl=op.patch.cgl;
const geom=new CGL.Geometry("simplespline");
outGeom.set(geom);

geom.vertices=[0,0,0,0,0,0,0,0,0];
var mesh=new CGL.Mesh(cgl,geom);
var buff=new Float32Array();
var needsRebuild=true;
var attr;

inPoints.onChange=
function(){ needsRebuild=true; };

op.toWorkPortsNeedToBeLinked(inPoints);

function rebuild()
{
    const points=inPoints.get();

    if(!points || points.length===0) return;

    var newLength=points.length;

    if(!(points instanceof Float32Array))
    {
        if(newLength!=buff.length)
        {
            buff=new Float32Array(newLength);
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
    if(strip.get())shader.glPrimitive=cgl.gl.LINE_STRIP;  // LINE_LOOP
        else shader.glPrimitive=cgl.gl.LINES;

    if(attr)
        if(numPoints.get()<=0)attr.numItems=buff.length/3;
            else attr.numItems=Math.min(numPoints.get(),buff.length/3);

    if(mesh) mesh.render(shader);

    shader.glPrimitive=oldPrim;

    next.trigger();
};