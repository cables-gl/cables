op.name = "CanvasSize";

let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
let width = op.addOutPort(new CABLES.Port(op, "width", CABLES.OP_PORT_TYPE_VALUE));
let height = op.addOutPort(new CABLES.Port(op, "height", CABLES.OP_PORT_TYPE_VALUE));

let cgl = op.patch.cgl;
let w = 0, h = 0;

exe.onTriggered = function ()
{
    height.set(cgl.canvasHeight);
    width.set(cgl.canvasWidth);
};
