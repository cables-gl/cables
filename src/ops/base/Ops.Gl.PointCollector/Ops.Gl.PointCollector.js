op.name="PointCollector";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var outPoints=op.addOutPort(new Port(op,"Points",OP_PORT_TYPE_ARRAY));


var points=[];
var mySplinePoints=[];
var cgl=op.patch.cgl;

var oldSplinePoints=null;
render.onTriggered=function()
{
    if(cgl.frameStore.SplinePoints) 
        oldSplinePoints=cgl.frameStore.SplinePoints;

    // mySplinePoints.length=0;
    cgl.frameStore.SplinePointCounter=0;
    cgl.frameStore.SplinePoints=mySplinePoints;
    
    
    cgl.frameStore.SplinePoints.length=cgl.frameStore.SplinePointCounter;

    trigger.trigger();

    outPoints.set(null);
    outPoints.set(cgl.frameStore.SplinePoints);

    // cgl.popMvMatrix();
    // cgl.frameStore.SplinePoints.length=0;
    // mySplinePoints.length=0;
    
    if(oldSplinePoints) cgl.frameStore.SplinePoints=oldSplinePoints;


};
