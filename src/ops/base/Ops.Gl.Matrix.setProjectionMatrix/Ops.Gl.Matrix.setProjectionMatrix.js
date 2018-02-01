
var inExe=op.inFunction("exe");
var inMatrix=op.inArray('Matrix');
var next=op.outFunction("next");
var cgl=op.patch.cgl;

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