var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;

var pos=vec3.create();
var empty=vec3.create();
var tempMat=mat4.create();

render.onTriggered=function()
{
    if(!cgl.frameStore.SplinePoints)return;

    if(cgl.frameStore.SplinePointsInverseOriginalMatrix)
    {
        mat4.multiply(tempMat,cgl.frameStore.SplinePointsInverseOriginalMatrix,cgl.mMatrix);
        vec3.transformMat4(pos, empty, tempMat);
    }
    else
    {
        vec3.transformMat4(pos, empty, cgl.mMatrix);
    }

    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+0]=pos[0];
    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+1]=pos[1];
    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+2]=pos[2];

    cgl.frameStore.SplinePointCounter+=3;

    trigger.trigger();
};
