const exe = op.inTrigger("exe");
const frequency = op.inFloat("frequency", 200);
const trigger = op.outTrigger("trigger");
const outCPS = op.outNumber("CPS");

let startTime = 0;
exe.onTriggered = exec;

frequency.onChange = function ()
{
    outCPS.set(1000 / frequency.get());
};

function exec()
{
    if (CABLES.now() - startTime > frequency.get())
    {
        startTime = CABLES.now();
        trigger.trigger();
    }
}
