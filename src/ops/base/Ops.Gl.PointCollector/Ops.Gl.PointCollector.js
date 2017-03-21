op.name="PointCollector";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var outPoints=op.addOutPort(new Port(op,"Points",OP_PORT_TYPE_ARRAY));

var inAbsolute=op.inValueBool("Absolute",true);

var points=[];
var mySplinePoints=[];
var cgl=op.patch.cgl;

var oldSplinePoints=null;

var pos=vec3.create();
var empty=vec3.create();
var m=mat4.create();
render.onTriggered=function()
{
    if(cgl.frameStore.SplinePoints) 
        oldSplinePoints=cgl.frameStore.SplinePoints;

    cgl.frameStore.SplinePointCounter=0;
    
    cgl.frameStore.SplinePoints=mySplinePoints;
    cgl.frameStore.SplinePoints.length=cgl.frameStore.SplinePointCounter;

    if(!inAbsolute.get())
    {
            
        mat4.invert(m,cgl.mvMatrix);
        cgl.frameStore.SplinePointsInverseOriginalMatrix=m;
        // vec3.transformMat4(pos, empty, cgl.mvMatrix);
        // var p=cgl.frameStore.SplinePoints;

        // for(var i=0;i<p.length/3;i++)
        // {
        //     p[i*3+0]-=pos[0];
        //     p[i*3+1]-=pos[1];
        //     p[i*3+2]-=pos[2];
        // }
    } else cgl.frameStore.SplinePointsInverseOriginalMatrix=null;

    trigger.trigger();

    outPoints.set(null);
    outPoints.set(cgl.frameStore.SplinePoints);

    if(oldSplinePoints) cgl.frameStore.SplinePoints=oldSplinePoints;
};
