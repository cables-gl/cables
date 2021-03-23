let cgl = op.patch.cgl;
let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let m = mat4.create();
let matrix = op.addOutPort(new CABLES.Port(this, "matrix", CABLES.OP_PORT_TYPE_ARRAY));

render.onTriggered = function ()
{
    mat4.copy(m, cgl.pMatrix);
    matrix.set(null);
    matrix.set(m);
    trigger.trigger();
};

matrix.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
