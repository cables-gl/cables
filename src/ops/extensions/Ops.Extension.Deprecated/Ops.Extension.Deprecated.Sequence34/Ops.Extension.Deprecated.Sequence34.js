const exe = op.inTrigger("exe");

let exes = [];
let triggers = [];

let triggerAll = function ()
{
    for (let i = 0; i < triggers.length; i++) triggers[i].trigger();
};

exe.onTriggered = triggerAll;

let num = 16;

for (let i = 0; i < num; i++)
{
    triggers.push(op.addOutPort(new CABLES.Port(op, "trigger " + i, CABLES.OP_PORT_TYPE_FUNCTION)));

    if (i < num - 1)
    {
        let newExe = op.addInPort(new CABLES.Port(op, "exe " + i, CABLES.OP_PORT_TYPE_FUNCTION));
        newExe.onTriggered = triggerAll;
        exes.push(newExe);
    }
}
