op.name='ExternalFunction';

var funcName=op.addInPort(new Port(op,"Function Name",OP_PORT_TYPE_VALUE,{type:'string'}));
var triggerButton=op.inFunctionButton("trigger");
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));

triggerButton.onTriggered=triggered;

funcName.onValueChanged=function()
{
    op.patch.config[funcName.get()]=triggered;
};

function triggered()
{
    trigger.trigger();
}

