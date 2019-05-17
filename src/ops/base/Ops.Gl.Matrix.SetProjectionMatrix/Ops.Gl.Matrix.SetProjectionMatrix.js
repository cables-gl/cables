const inExe=op.inTrigger("exe");
const inMatrix=op.inArray('Matrix');
const next=op.outTrigger("next");
const cgl=op.patch.cgl;

inExe.onTriggered=function()
{
    if(inMatrix.get())
    {
        cgl.pushPMatrix();

        mat4.copy(cgl.pMatrix,inMatrix.get() );

        next.trigger();
        cgl.popPMatrix();

    }

};