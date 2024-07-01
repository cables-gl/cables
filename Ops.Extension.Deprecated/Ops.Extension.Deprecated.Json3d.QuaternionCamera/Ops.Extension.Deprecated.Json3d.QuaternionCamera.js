op.name = "QuaternionCamera";
let cgl = op.patch.cgl;
let patch = op.patch;
let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let posX = op.addInPort(new CABLES.Port(op, "posX"));
let posY = op.addInPort(new CABLES.Port(op, "posY"));
let posZ = op.addInPort(new CABLES.Port(op, "posZ"));

let qx = op.addInPort(new CABLES.Port(op, "quat x"));
let qy = op.addInPort(new CABLES.Port(op, "quat y"));
let qz = op.addInPort(new CABLES.Port(op, "quat z"));
let qw = op.addInPort(new CABLES.Port(op, "quat w"));

let fov = op.addInPort(new CABLES.Port(op, "fov"));

let clipNear = op.addInPort(new CABLES.Port(op, "clip near"));
let clipFar = op.addInPort(new CABLES.Port(op, "clip far"));

let lax = op.addInPort(new CABLES.Port(op, "lookat x"));
let lay = op.addInPort(new CABLES.Port(op, "lookat y"));
let laz = op.addInPort(new CABLES.Port(op, "lookat z"));

let matrix = op.addInPort(new CABLES.Port(op, "matrix")); // OP_PORT_TYPE_ARRAY

qx.set(0.0);
qy.set(0.0);
qz.set(0.0);
qw.set(0.0);

let q = quat.create();
let vPos = vec3.create();
let vPosDir = vec3.create();
let vUp = vec3.create();
vec3.set(vUp, 0, 1, 0);
let qMat = mat4.create();
let transMatrix = mat4.create();
let vCenter = vec3.create();
let vLookat = vec3.create();

render.onTriggered = function ()
{
    trigger.trigger();
};
