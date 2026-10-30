const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    matrix = op.outArray("matrix", 16);

const m = mat4.create();

render.onTriggered = function ()
{
    if (op.patch.cg)
    {
        mat4.copy(m, op.patch.cg.mMatrix);
        matrix.setRef(m);
    }
    trigger.trigger();
};

matrix.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
