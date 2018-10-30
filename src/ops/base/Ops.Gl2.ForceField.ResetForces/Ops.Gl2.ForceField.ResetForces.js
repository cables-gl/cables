op.name="ResetForces";

var exec=op.inTrigger("Exec");


var next=op.outTrigger("next");


exec.onTriggered=function()
{
    CABLES.forceFieldForces=CABLES.forceFieldForces||[];
    CABLES.forceFieldForces.length=0;

    next.trigger();
    
};