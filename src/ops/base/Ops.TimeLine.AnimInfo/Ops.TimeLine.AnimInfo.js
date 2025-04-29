const
    inAnim = op.inObject("Anim"),
    outNumKeys = op.outNumber("Total Keys"),
    outLength = op.outNumber("Length Seconds");

inAnim.onChange = update;

function update()
{
    const anim = inAnim.get() || new CABLES.Anim();

    outLength.set(anim.getLength());
    outNumKeys.set(anim.keys.length);
}
