
var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");


var cgl=op.patch.cgl;
var pos=vec3.create();
var empty=vec3.create();
render.onTriggered=function()
{
    vec3.transformMat4(pos, empty, cgl.mvMatrix);

    outX.set(pos[0]);
    outY.set(pos[1]);
    outZ.set(pos[2]);

    trigger.trigger();
};
