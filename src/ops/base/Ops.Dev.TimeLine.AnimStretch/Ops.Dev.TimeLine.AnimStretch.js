const
    inAnim = op.inObject("Anim"),
    inTime = op.inFloat("Time", 0),
    outValue = op.outNumber("Value");

inTime.onChange =
inAnim.onChange = update;

function update()
{
    const anim = inAnim.get() || new CABLES.Anim();
    outValue.set(anim.getValue(inTime.get()));
}
