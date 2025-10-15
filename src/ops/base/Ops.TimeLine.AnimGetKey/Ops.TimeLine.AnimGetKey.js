const
    inAnim = op.inObject("Anim"),
    inTime = op.inFloat("Time", 0),
    outValue = op.outNumber("Index"),
    outIndex = op.outNumber("Key Value"),
    outTime = op.outNumber("Key Time");

inTime.onChange =
inAnim.onChange = update;

function update()
{
    const anim = inAnim.get() || new CABLES.Anim();
    const keyIdx = anim.getKeyIndex(inTime.get());
    const key = anim.getKey(inTime.get());
    if (key)
    {
        outIndex.set(keyIdx);
        outValue.set(anim.keys[keyIdx].value);
        outTime.set(anim.keys[keyIdx].time);
    }
    else
    {
        outIndex.set(-1);
    }
}
