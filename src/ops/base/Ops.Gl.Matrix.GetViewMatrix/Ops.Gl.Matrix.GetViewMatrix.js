let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");
let matrix = op.addOutPort(new CABLES.Port(op, "matrix", CABLES.OP_PORT_TYPE_ARRAY));

let m = mat4.create();

render.onTriggered = function ()
{
    mat4.copy(m, op.patch.cgl.vMatrix);
    matrix.set(null);
    matrix.set(m);
    trigger.trigger();
};

matrix.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
