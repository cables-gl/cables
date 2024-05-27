// welcome to your new op!
// have a look at the documentation:
// https://cables.gl/docs/5_writing_ops/dev_ops/dev_ops

const
    exec = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    resultActive = op.outBoolNum("user is or was active"),
    resultHasBeenActive = op.outBoolNum("user has been active"),
    resultIsActive = op.outBoolNum("user is active"),
    outSupport = op.outBoolNum("Supported");

op.toWorkPortsNeedToBeLinked(exec);

exec.onTriggered = () =>
{
    if (!navigator.userActivation)
    {
        outSupport.set(false);
    }
    else
    {
        outSupport.set(true);
        resultActive.set(navigator.userActivation.isActive || navigator.userActivation.hasBeenActive);
        resultIsActive.set(navigator.userActivation.hasBeenActive);
        resultIsActive.set(navigator.userActivation.isActive);
    }
    next.trigger();
};
