let exec = op.inTrigger("Exec");
let next = op.outTrigger("next");

exec.onTriggered = function ()
{
    CABLES.forceFieldForces = CABLES.forceFieldForces || [];
    CABLES.forceFieldForces.length = 0;

    next.trigger();
};
