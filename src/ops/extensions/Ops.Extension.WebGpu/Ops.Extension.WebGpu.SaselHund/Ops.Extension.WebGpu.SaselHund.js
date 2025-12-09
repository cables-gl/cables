// welcome to your new op!
// have a look at the documentation:
// https://cables.gl/docs/5_writing_ops/dev_ops/dev_ops

const
    exec = op.inTrigger("Trigger"),
    myNumber = op.inFloat("Number"),
    next = op.outTrigger("Next"),
    result = op.outNumber("Result");

exec.onTriggered = () =>
{
    result.set(myNumber.get() * 100);
};
