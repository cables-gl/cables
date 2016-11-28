op.name="QuaternionCamera";
var cgl=op.patch.cgl;
var patch=op.patch;
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));


var posX=op.addInPort(new Port(op,"posX"));
var posY=op.addInPort(new Port(op,"posY"));
var posZ=op.addInPort(new Port(op,"posZ"));

var qx=op.addInPort(new Port(op,"quat x"));
var qy=op.addInPort(new Port(op,"quat y"));
var qz=op.addInPort(new Port(op,"quat z"));
var qw=op.addInPort(new Port(op,"quat w"));

var fov=op.addInPort(new Port(op,"fov"));

var clipNear=op.addInPort(new Port(op,"clip near"));
var clipFar=op.addInPort(new Port(op,"clip far"));

var lax=op.addInPort(new Port(op,"lookat x"));
var lay=op.addInPort(new Port(op,"lookat y"));
var laz=op.addInPort(new Port(op,"lookat z"));

var matrix=op.addInPort(new Port(op,"matrix")); //OP_PORT_TYPE_ARRAY


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
