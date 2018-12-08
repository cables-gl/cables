const render=op.inTrigger("render");
const mul=op.inValueFloat("mul");
const trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;

render.onTriggered=function()
{
    var pos=[0,0,0];
    vec3.transformMat4(pos, [0,0,0], cgl.mMatrix);

    cgl.pushModelMatrix();
    vec3.mul(pos,pos,[mul.get(),mul.get(),mul.get()] );

    mat4.translate(cgl.mMatrix,cgl.mMatrix, pos );
    trigger.trigger();

    cgl.popModelMatrix();
};