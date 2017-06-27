op.name="PointCollector";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var outPoints=op.addOutPort(new Port(op,"Points",OP_PORT_TYPE_ARRAY));
outPoints.ignoreValueSerialize=true;

var inAbsolute=op.inValueBool("Absolute",true);

var points=[];
var cgl=op.patch.cgl;

var oldSplinePoints=null;

var pos=vec3.create();
var empty=vec3.create();
var m=mat4.create();

render.onTriggered=function()
{
    if(cgl.frameStore.SplinePoints) 
    {
        oldSplinePoints=cgl.frameStore.SplinePoints;
        cgl.frameStore.SplinePoints=[];
    }

    cgl.frameStore.SplinePointCounter=0;
    
    cgl.frameStore.SplinePoints=cgl.frameStore.SplinePoints||[];
    
    if(cgl.frameStore.SplinePointCounter!=cgl.frameStore.SplinePoints.length)
    cgl.frameStore.SplinePoints.length=cgl.frameStore.SplinePointCounter;

    if(!inAbsolute.get())
    {
        mat4.invert(m,cgl.mvMatrix);
        cgl.frameStore.SplinePointsInverseOriginalMatrix=m;
    } 
    else
    {
        cgl.frameStore.SplinePointsInverseOriginalMatrix=null;
    }

    trigger.trigger();

    outPoints.set(null);
    outPoints.set(cgl.frameStore.SplinePoints);

    if(oldSplinePoints) cgl.frameStore.SplinePoints=oldSplinePoints;
};
