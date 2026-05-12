const
    exec = op.inTrigger("Trigger"),
    dump = op.inTriggerButton("Record one frame"),
    next = op.outTrigger("Next"),
    result = op.outArray("Result");

let run = false;

dump.onTriggered = () =>
{
    console.log("nana");
    run = true;
};

const cgl = op.patch.cgl;

exec.onTriggered = () =>
{

    if (run)
    {
        console.log("ye");
        cgl.profileDrawCalls = [];
    }

    next.trigger();

    if (run)
    {
        result.setRef(cgl.profileDrawCalls);

        console.log("end");
        run = false;
        cgl.profileDrawCalls = null;
    }
};
