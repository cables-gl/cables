let cgl = op.patch.cgl;
let render = op.inTrigger("render");
let inIdentity = op.inValueBool("Identity", false);
let next = op.outTrigger("trigger");

let m = mat4.create();
let matrix = op.inArray("matrix");

render.onTriggered = function ()
{
    cgl.pushModelMatrix();

    if (inIdentity.get()) mat4.identity(cgl.mMatrix);

    const m = matrix.get();

    if (m) mat4.multiply(cgl.mMatrix, cgl.mMatrix, m);

    next.trigger();
    cgl.popModelMatrix();
};

matrix.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
