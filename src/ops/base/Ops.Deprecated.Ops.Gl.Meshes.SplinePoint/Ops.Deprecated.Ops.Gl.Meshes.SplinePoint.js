op.name='SplinePoint';

var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

render.onTriggered=function()
{
    if(!cgl.frameStore.SplinePoints)return;
    var pos=[0,0,0];
    vec3.transformMat4(pos, [0,0,0], cgl.mvMatrix);

    cgl.frameStore.SplinePoints.push(pos[0]);
    cgl.frameStore.SplinePoints.push(pos[1]);
    cgl.frameStore.SplinePoints.push(pos[2]);

    trigger.trigger();
};
