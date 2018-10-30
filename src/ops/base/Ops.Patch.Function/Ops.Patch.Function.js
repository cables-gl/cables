op.name='ExternalFunction';

var funcName=op.addInPort(new CABLES.Port(op,"Function Name",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));
var triggerButton=op.inTriggerButton("trigger");
var trigger=op.addOutPort(new CABLES.Port(op,"Trigger",CABLES.OP_PORT_TYPE_FUNCTION));

triggerButton.onTriggered=triggered;

funcName.onChange=function()
{
    op.patch.config[funcName.get()]=triggered;
};

function triggered()
{
    trigger.trigger();
}

