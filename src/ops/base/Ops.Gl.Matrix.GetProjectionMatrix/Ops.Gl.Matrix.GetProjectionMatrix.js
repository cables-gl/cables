const
    cgl = op.patch.cgl,
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    matrix = op.outArray("matrix", null, 4);

let m = mat4.create();
mat4.identity(m);
matrix.set(m);

render.onTriggered = function ()
{
    mat4.copy(m, cgl.pMatrix);
    matrix.set(null);
    matrix.set(m);
    trigger.trigger();
};
