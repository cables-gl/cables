const
    exec = op.inTrigger("Execute"),
    next = op.outTrigger("Next"),

    prim = op.inValueSelect("Primitive", ["LINES", "LINE_STRIP", "LINE_LOOP", "POINTS", "TRIANGLES", "TRIANGLE_FAN", "TRIANGLE_STRIP"], "LINES");
const cgl = op.patch.cgl;

let glPrim = cgl.gl.LINES;

prim.onChange = function ()
{
    if (prim.get() == "LINES")glPrim = cgl.gl.LINES;
    if (prim.get() == "LINE_STRIP")glPrim = cgl.gl.LINE_STRIP;
    if (prim.get() == "LINE_LOOP")glPrim = cgl.gl.LINE_LOOP;
    if (prim.get() == "POINTS")glPrim = cgl.gl.POINTS;
    if (prim.get() == "TRIANGLES")glPrim = cgl.gl.TRIANGLES;
    if (prim.get() == "TRIANGLE_FAN")glPrim = cgl.gl.TRIANGLE_FAN;
    if (prim.get() == "TRIANGLE_STRIP")glPrim = cgl.gl.TRIANGLE_STRIP;
};

exec.onTriggered = function ()
{
    let shader = cgl.getShader();
    if (!shader) return;
    let oldPrim = shader.glPrimitive;
    shader.glPrimitive = glPrim;

    next.trigger();

    shader.glPrimitive = oldPrim;
};
