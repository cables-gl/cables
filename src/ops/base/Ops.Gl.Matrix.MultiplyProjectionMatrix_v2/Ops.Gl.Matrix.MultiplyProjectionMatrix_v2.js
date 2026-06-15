const
    render = op.inTrigger("render"),
    matrix = op.inArray("matrix"),
    inIdentity = op.inValueBool("Identity", false),
    trigger = op.outTrigger("trigger");

const m = mat4.create();
const cgl = this.patch.cgl;

matrix.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

render.onTriggered = function ()
{
    cgl.pushPMatrix();

    if (matrix.get())
    {
        if (inIdentity.get()) mat4.identity(cgl.pMatrix);

        mat4.multiply(cgl.pMatrix, cgl.pMatrix, matrix.get());
    }

    trigger.trigger();
    cgl.popPMatrix();
};
