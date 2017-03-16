op.name="PointCollectorCollect";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

var pos=[0,0,0];
var empty=[0,0,0];
render.onTriggered=function()
{
    if(!cgl.frameStore.SplinePoints)return;
    
    vec3.transformMat4(pos, empty, cgl.mvMatrix);

    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+0]=pos[0];
    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+1]=pos[1];
    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+2]=pos[2];
    
    cgl.frameStore.SplinePointCounter+=3;

    trigger.trigger();
};
