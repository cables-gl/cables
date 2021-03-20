const
    funcName=op.inString("Function Name","default"),
    triggerButton=op.inTriggerButton("Trigger"),
    outTrigger=op.outTrigger('Next');

triggerButton.onTriggered=triggered;

funcName.onChange=function()
{
    op.patch.config[funcName.get()]=triggered;
};

function triggered()
{
    outTrigger.trigger();
}

