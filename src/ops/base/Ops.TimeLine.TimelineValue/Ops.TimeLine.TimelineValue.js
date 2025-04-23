const
    inTime = op.inValue("Time"),
    animVal = op.inValue("Value"),
    timeUnit = op.inValueSelect("Unit", ["Seconds", "Frames"], "Seconds"),
    outVal = op.outNumber("Result"),
    outArr = op.outArray("Anim Array", [], 2),
    outEnded = op.outBoolNum("Anim Finished");

inTime.onChange = update;
let hasError = false;

animVal.setAnimated(true);
animVal.onChange = update;
animVal.anim.onChange =
    op.onLoaded = animChange;

let useFrames = false;

timeUnit.onChange = function ()
{
    useFrames = (timeUnit.get() == "Frames");
};

function update()
{
    inTime.get();

    if (animVal.isAnimated())
    {
        let t = inTime.get();
        if (useFrames) t /= 30.0;
        const v = animVal.anim.getValue(t);
        outEnded.set(animVal.anim.hasEnded(t));
        outVal.set(v);
        if (hasError)
        {
            op.setUiError("noanim", null);
            hasError = false;

            animVal.anim.onChange = animChange;
        }
    }
    else
    {
        op.setUiError("noanim", "Port \"animVal\" should be animated");
        hasError = true;
    }
}

function animChange()
{
    const arr = [];
    if (animVal.anim.keys && animVal.anim.keys.length > 0)
    {
        arr.length = animVal.anim.keys.length * 2;

        for (let i = 0; i < animVal.anim.keys.length; i++)
        {
            arr[i * 2 + 0] = animVal.anim.keys[i].time;
            arr[i * 2 + 1] = animVal.anim.keys[i].value;
        }
    }

    outArr.setRef(arr);
}
