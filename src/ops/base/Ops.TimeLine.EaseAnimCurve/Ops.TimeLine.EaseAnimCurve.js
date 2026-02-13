const
    exec = op.inTrigger("Trigger"),
    myNumber = op.inFloat("Number"),
    inAnim = op.inObject("Anim", null, "anim"),
    next = op.outTrigger("Next"),
    result = op.outNumber("Result");

op.toWorkPortsNeedToBeLinked(inAnim);

exec.onTriggered = () =>
{
    const anim = inAnim.get();
    if (anim)
    {
        const v = anim.getValue(myNumber.get() * anim.getLength());
        result.set(v);
    }
    else
    {
        result.set(myNumber.get());
    }

    next.trigger();
};
