const exe = op.inTrigger("exe");
let number = op.addInPort(new CABLES.Port(op, "number"));
let max = op.addInPort(new CABLES.Port(op, "max"));
let numOut = op.addInPort(new CABLES.Port(op, "num outputs"));
let num = op.addOutPort(new CABLES.Port(op, "num", CABLES.OP_PORT_TYPE_VALUE));

number.set(0);
max.set(1);
numOut.set(2);
num.set(0);

let triggers = [];
let numTriggers = 20;

let trigger = function ()
{
    let s = max.get() / numOut.get();
    let index = Math.abs(Math.floor(number.get() / s));

    num.set(index);

    if (!isNaN(index) && index < numTriggers)
    {
        triggers[index].trigger();
    }
};

exe.onTriggered = trigger;

for (let i = 0; i < numTriggers; i++)
{
    triggers.push(op.addOutPort(new CABLES.Port(op, "trigger " + i, CABLES.OP_PORT_TYPE_FUNCTION)));
}
