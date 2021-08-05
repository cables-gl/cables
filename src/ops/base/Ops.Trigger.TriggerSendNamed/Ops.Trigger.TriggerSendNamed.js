const trigger = op.inTriggerButton("Trigger");
const varname = op.inString("Named Trigger", "");

trigger.onTriggered = doTrigger;

varname.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": varname.get() });
};

function doTrigger()
{
    const arr = op.patch.namedTriggers[varname.get()];
    // fire an event even if noone is receiving this trigger
    // this way TriggerReceiveFilter can still handle it
    op.patch.emitEvent("namedTriggerSent", varname.get());

    if (!arr)
    {
        return;
    }

    for (let i = 0; i < arr.length; i++)
    {
        arr[i]();
    }
}
