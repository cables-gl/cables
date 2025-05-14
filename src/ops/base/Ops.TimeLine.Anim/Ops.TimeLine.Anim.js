const
    animVal = op.inValue("Value"),
    inloop = op.inBool("loop", false),
    outAnim = op.outObject("Anim", null, "anim"),
    outLengthLoop = op.outNumber("Loop Length"),
    outLength = op.outNumber("Length");

animVal.setAnimated(true);
animVal.onChange = update;

inloop.onChange = () =>
{
    animVal.anim.setLoop(inloop.get());
};

function update()
{
    const anim = animVal.anim;
    outAnim.setRef(anim);
    if (anim.keys.length > 0)
    {
        outLengthLoop.set(anim.getLengthLoop());
        outLength.set(anim.lastKey.time);
    }
    else
    {
        outLengthLoop.set(0);
        outLength.set(0);
    }
}
