const passThrough = op.inValueBool('Pass Through',true),
    exe = op.inTrigger('Execute'),
    triggerOut = op.outTrigger('Trigger out');

exe.onTriggered = function()
{
    if(passThrough.get())
        triggerOut.trigger();
}
