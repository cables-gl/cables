op.name="PointCollectorScreenCoords";


var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

var m=mat4.create();
var pos=[0,0,0];
var trans=vec3.create();


render.onTriggered=function()
{
    if(!cgl.frameStore.SplinePoints)return;
    
    // vec3.transformMat4(pos, [0,0,0], cgl.mvMatrix);

    mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);
    vec3.transformMat4(pos, [0,0,0], m);
    
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var vp=cgl.getViewPort();
    
    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+0]= vp[2]-( vp[2]  * 0.5 - trans[0] * vp[2] * 0.5 / trans[2] );
    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+1]= vp[3]-( vp[3]  * 0.5 + trans[1] * vp[3] * 0.5 / trans[2] );

    
    cgl.frameStore.SplinePointCounter+=2;

    trigger.trigger();
};
