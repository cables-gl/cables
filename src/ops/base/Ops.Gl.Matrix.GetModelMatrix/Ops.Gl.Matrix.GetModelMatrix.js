const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    matrix = op.outArray("matrix", 4);

const m = mat4.create();

render.onTriggered = function ()
{
    mat4.copy(m, op.patch.cg.mMatrix);
    matrix.set(null);
    matrix.set(m);
    trigger.trigger();
};

matrix.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
