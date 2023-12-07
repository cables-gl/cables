const
    currentVal = op.outNumber("Value"),
    oldVal = op.outNumber("Last Value"),
    triggered = op.outTrigger("Triggered");

let triggers = [];
let inVals = [];
let inExes = [];

function onTrigger()
{
    oldVal.set(currentVal.get());
    currentVal.set(inVals[this.slot].get());
    triggered.trigger();
}

let num = 8;
for (let i = 0; i < num; i++)
{
    let newExe = op.addInPort(new CABLES.Port(op, "Trigger " + i, CABLES.OP_PORT_TYPE_FUNCTION));
    newExe.slot = i;
    newExe.onTriggered = onTrigger.bind(newExe);
    let newVal = op.addInPort(new CABLES.Port(op, "Value " + i, CABLES.OP_PORT_TYPE_VALUE));
    inVals.push(newVal);
}

let defaultVal = op.inValueString("Default Value");

currentVal.set(defaultVal.get());
oldVal.set(defaultVal.get());

defaultVal.onChange = function ()
{
    oldVal.set(currentVal.get());
    currentVal.set(defaultVal.get());
};
