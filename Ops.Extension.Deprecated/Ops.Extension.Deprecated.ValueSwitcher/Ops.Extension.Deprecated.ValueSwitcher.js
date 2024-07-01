const currentVal = op.outValue("Value"),
    oldVal = op.outValue("Last Value"),
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
    let newExe = op.inTrigger("Trigger " + i);
    newExe.slot = i;
    newExe.onTriggered = onTrigger.bind(newExe);
    let newVal = op.inValueFloat("Value " + i);
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
