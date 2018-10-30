op.name="QuaternionCamera";
var cgl=op.patch.cgl;
var patch=op.patch;
var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');


var posX=op.addInPort(new CABLES.Port(op,"posX"));
var posY=op.addInPort(new CABLES.Port(op,"posY"));
var posZ=op.addInPort(new CABLES.Port(op,"posZ"));

var qx=op.addInPort(new CABLES.Port(op,"quat x"));
var qy=op.addInPort(new CABLES.Port(op,"quat y"));
var qz=op.addInPort(new CABLES.Port(op,"quat z"));
var qw=op.addInPort(new CABLES.Port(op,"quat w"));

var fov=op.addInPort(new CABLES.Port(op,"fov"));

var clipNear=op.addInPort(new CABLES.Port(op,"clip near"));
var clipFar=op.addInPort(new CABLES.Port(op,"clip far"));

var lax=op.addInPort(new CABLES.Port(op,"lookat x"));
var lay=op.addInPort(new CABLES.Port(op,"lookat y"));
var laz=op.addInPort(new CABLES.Port(op,"lookat z"));

var matrix=op.addInPort(new CABLES.Port(op,"matrix")); //OP_PORT_TYPE_ARRAY


qx.set(0.0);
qy.set(0.0);
qz.set(0.0);
qw.set(0.0);

var q=quat.create();
var vPos=vec3.create();
var vPosDir=vec3.create();
var vUp=vec3.create();
vec3.set(vUp,0,1,0);
var qMat=mat4.create();
var transMatrix=mat4.create();
var vCenter=vec3.create();
var vLookat=vec3.create();

render.onTriggered=function()
{
   
    trigger.trigger();


};
