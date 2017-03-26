op.name="ResetForces";

var exec=op.inFunction("Exec");


var next=op.outFunction("next");


exec.onTriggered=function()
{
    CABLES.forceFieldForces=CABLES.forceFieldForces||[];
    CABLES.forceFieldForces.length=0;

    next.trigger();
    
};