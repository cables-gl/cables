const
    inTrigger = op.inTriggerButton("Execute"),
    inArray = op.inArray("Array"),
    inIndex = op.inInt("Index", 0),
    inValue = op.inFloat("Number", 1),
    outNext = op.outTrigger("Next"),
    outArray = op.outArray("Result");

let arr = [];
inArray.onChange = () =>
{
    arr = inArray.get();
};

inTrigger.onTriggered = () =>
{
    if (!arr)
    {
        outArray.set(null);
        return;
    }

    const newArr = [];
    // if (newArr.length != arr.length) newArr.length = arr.length;
    for (let i = 0; i < arr.length; i++) newArr[i] = arr[i];
    const idx = Math.floor(inIndex.get());

    if (idx >= 0)
    // if (idx >= 0 && idx < arr.length)
    {
        newArr[idx] = inValue.get();
    }

    arr = newArr;
    outArray.set(null);
    outArray.set(newArr);
    outNext.trigger();
};
