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
    cgl.pushViewMatrix();

    if (matrix.get())
    {
        if (inIdentity.get()) mat4.identity(cgl.vMatrix);

        mat4.multiply(cgl.vMatrix, cgl.vMatrix, matrix.get());
    }

    trigger.trigger();
    cgl.popViewMatrix();
};
