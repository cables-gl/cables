const
    inTrigger = op.inTriggerButton("Execute"),
    inArray = op.inArray("Array"),
    inIndex = op.inInt("Index", 0),
    inValue = op.inFloat("Number", 1),
    outNext = op.outTrigger("Next"),
    outArray = op.outArray("Result");

const newArr = [];
let hasChanged = false;
inArray.onChange = () => { hasChanged = true; };

inTrigger.onTriggered =
    () =>
    {
        const arr = inArray.get();

        if (!arr)
        {
            outArray.set(null);
            return;
        }

        if (newArr.length != arr.length) newArr.length = arr.length;
        for (let i = 0; i < arr.length; i++) newArr[i] = arr[i];
        hasChanged = false;

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
