const passThrough = op.inValueBool('Pass Through',true),
    triggerIn = op.inTrigger('Trigger to pass'),
    exe = op.inTrigger('Execute'),
    triggerOut = op.outTrigger('Trigger out');

exe.onTriggered = function()
{
    if(passThrough.get())
        triggerOut.trigger();
}
