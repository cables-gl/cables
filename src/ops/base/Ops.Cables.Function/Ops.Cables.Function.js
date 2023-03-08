let funcName = op.addInPort(new CABLES.Port(op, "Function Name", CABLES.OP_PORT_TYPE_VALUE, { "type": "string" }));
let triggerButton = op.inTriggerButton("trigger");
let outTrigger = op.outTrigger("Next");

triggerButton.onTriggered = triggered;

funcName.onChange = function ()
{
    op.patch.config[funcName.get()] = triggered;
};

function triggered()
{
    outTrigger.trigger();
}
