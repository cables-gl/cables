const
    exe = op.inTrigger('Execute'),
    passThrough = op.inBool('Pass Through',true),
    triggerOut = op.outTrigger('Trigger out');

exe.onTriggered = function()
{
    if(passThrough.get())
        triggerOut.trigger();
}
