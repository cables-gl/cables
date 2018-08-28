var render=op.inFunction("Render");
var inNum=op.inValue("Num",10);
var inSpacing=op.inValue("Spacing",1);
var next=op.outFunction("Next");


var cgl=op.patch.cgl;
var mesh=null;

inNum.onChange=init;
inSpacing.onChange=init;

function init()
{
    var geomVertical=new CGL.Geometry();

    var space=inSpacing.get();
    var num=Math.floor(inNum.get());

    var l=space*num/2;

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
    }

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

