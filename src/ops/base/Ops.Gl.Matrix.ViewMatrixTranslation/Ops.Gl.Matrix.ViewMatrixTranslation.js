op.name="ViewCoordinates";


var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");


var cgl=op.patch.cgl;
var pos=[0,0,0];

render.onTriggered=function()
{
    vec3.transformMat4(pos, [0,0,0], cgl.vMatrix);

    outX.set(pos[0]);
    outY.set(pos[1]);
    outZ.set(pos[2]);

    trigger.trigger();
};
