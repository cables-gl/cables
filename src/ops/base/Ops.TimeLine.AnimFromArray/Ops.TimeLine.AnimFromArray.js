const
    loopstr = ["Off", "Repeat", "Mirror", "Offset"],
    animVal = op.inValue("Value"),
    inKeys = op.inArray("Key Times"),
    inValues = op.inArray("Key Values"),
    inText = op.inArray("Key Text"),
    inloop = op.inSwitch("loop", loopstr),
    outAnim = op.outObject("Anim", null, "anim"),
    outLengthLoop = op.outNumber("Loop Length"),
    outLength = op.outNumber("Length");

animVal.setAnimated(true);
inKeys.onChange =
inText.onChange =
inValues.onChange = update;
let anim = animVal.anim;

inloop.onChange = () =>
{
    anim.setLoop(loopstr.indexOf(inloop.get()));
};

function update()
{
    anim.setUiAttribs({ "readOnly": true });
    outAnim.setRef(anim);
    const times = inKeys.get();
    const values = inValues.get();
    const texts = inText.get();
    if (times)
    {
        anim.clear();
        anim.eventsPaused = true;
        for (let i = 0; i < times.length; i++)
        {
            let v = 0;
            if (values)v = values[i];
            if (i == times.length - 1)anim.eventsPaused = false;

            anim.setValue(times[i], v);
            if (texts)
            {
                const k = anim.getKey(times[i]);
                k.setUiAttribs({ "text": texts[i] });
            }
        }
    }
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
