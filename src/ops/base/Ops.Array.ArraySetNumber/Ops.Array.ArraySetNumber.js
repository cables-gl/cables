const
    inTrigger = op.inTriggerButton("Execute"),
    inArray = op.inArray("Array"),
    inIndex = op.inInt("Index", 0),
    inValue = op.inFloat("Number", 1),
    inReset = op.inTriggerButton("Reset"),
    outNext = op.outTrigger("Next"),
    outArray = op.outArray("Result");

const newArr = [];

inReset.onTriggered = function ()
{
    copyArray(true);
};
inArray.onChange = copyArray;

inTrigger.onTriggered =
    () =>
    {
        const arr = inArray.get();

        if (!arr) return;
        if (newArr.length != arr.length)newArr.length = arr.length;

        const idx = Math.floor(inIndex.get());

        if (idx >= 0)
        {
            newArr[idx] = inValue.get();
        }

        inArray.onChange = null;
        outArray.set(null);
        outArray.set(newArr);
        outNext.trigger();
    };

function copyArray(force)
{
    const arr = inArray.get();

    if (!arr) return;

    if (force === true || (arr && !outArray.get()))
    {
        if (newArr.length != arr.length) newArr.length = arr.length;
        for (let i = 0; i < arr.length; i++) newArr[i] = arr[i];

        outArray.set(null);
        outArray.set(newArr);
    }
}
