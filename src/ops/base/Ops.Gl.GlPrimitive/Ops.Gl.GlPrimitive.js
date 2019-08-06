var exec=op.inTrigger("Execute");
var next=op.outTrigger("Next");

var prim=op.inValueSelect("Primitive",['LINES','LINE_STRIP','LINE_LOOP','POINTS','TRIANGLES','TRIANGLE_FAN','TRIANGLE_STRIP'],'LINES');
var cgl=op.patch.cgl;

var glPrim=cgl.gl.LINES;

prim.onChange=function()
{
    if(prim.get()=='LINES')glPrim=cgl.gl.LINES;
    if(prim.get()=='LINE_STRIP')glPrim=cgl.gl.LINE_STRIP;
    if(prim.get()=='LINE_LOOP')glPrim=cgl.gl.LINE_LOOP;
    if(prim.get()=='POINTS')glPrim=cgl.gl.POINTS;
    if(prim.get()=='TRIANGLES')glPrim=cgl.gl.TRIANGLES;
    if(prim.get()=='TRIANGLE_FAN')glPrim=cgl.gl.TRIANGLE_FAN;
    if(prim.get()=='TRIANGLE_STRIP')glPrim=cgl.gl.TRIANGLE_STRIP;
};

exec.onTriggered=function()
{
    var shader=cgl.getShader();
    if(!shader)return;
    var oldPrim=shader.glPrimitive;
    shader.glPrimitive=glPrim;///cgl.gl.LINE_STRIP;
    // GL_TRIANGLE_STRIP
    // shader.glPrimitive=cgl.gl.LINE_LOOP;
    // shader.glPrimitive=cgl.gl.LINES;
    // shader.glPrimitive=cgl.gl.POINTS;

    next.trigger();

    shader.glPrimitive=oldPrim;

};