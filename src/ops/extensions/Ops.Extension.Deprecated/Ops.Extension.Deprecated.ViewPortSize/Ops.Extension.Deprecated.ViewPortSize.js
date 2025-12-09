let exe = op.inTrigger("exe");
let trigger = op.outTrigger("trigger");

let outX = op.addOutPort(new CABLES.Port(op, "x", CABLES.OP_PORT_TYPE_VALUE));
let outY = op.addOutPort(new CABLES.Port(op, "y", CABLES.OP_PORT_TYPE_VALUE));
let outWidth = op.addOutPort(new CABLES.Port(op, "width", CABLES.OP_PORT_TYPE_VALUE));
let outHeight = op.addOutPort(new CABLES.Port(op, "height", CABLES.OP_PORT_TYPE_VALUE));

let cgl = op.patch.cgl;
let w = 0, h = 0, x = 0, y = 0;

exe.onTriggered = function ()
{
    let vp = cgl.getViewPort();

    if (vp[0] != x) { w = vp[0]; outX.set(vp[0]); }
    if (vp[1] != y) { h = vp[1]; outY.set(vp[1]); }
    if (vp[2] != h) { h = vp[2]; outWidth.set(vp[2]); }
    if (vp[3] != w) { w = vp[3]; outHeight.set(vp[3]); }

    trigger.trigger();
};
