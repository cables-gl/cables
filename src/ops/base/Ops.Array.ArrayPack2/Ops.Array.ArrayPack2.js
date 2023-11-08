const
    exe = op.inTriggerButton("Trigger in"),
    inArr1 = op.inArray("Array 1"),
    inArr2 = op.inArray("Array 2"),
    exeOut = op.outTrigger("Trigger out"),
    outArr = op.outArray("Array out", null, 2),
    outArrayLength = op.outNumber("Array length");

let showingError = false;

let arr = [];
let emptyArray = [];
let needsCalc = true;

exe.onTriggered = update;

inArr1.onChange = inArr2.onChange = calcLater;
function calcLater()
{
    needsCalc = true;
}

function update()
{
    let array1 = inArr1.get();
    let array2 = inArr2.get();

    if (!array1 && !array2)
    {
        outArr.set(null);
        return;
    }
    if (needsCalc)
    {
        let arrlen = 0;

        if (!array1 || !array2)
        {
            if (array1) arrlen = array1.length;
            else if (array2) arrlen = array2.length;

            if (emptyArray.length != arrlen)
                for (let i = 0; i < arrlen; i++) emptyArray[i] = 0;

            if (!array1)array1 = emptyArray;
            if (!array2)array2 = emptyArray;
        }

        if (array1.length !== array2.length)
        {
            if (!showingError)
            {
                op.uiAttr({ "error": "Arrays do not have the same length !" });
                showingError = true;
            }
            return;
        }

        if (showingError)
        {
            showingError = false;
            op.uiAttr({ "error": null });
        }

        arr.length = array1.length;
        for (let i = 0; i < array1.length; i++)
        {
            arr[i * 2 + 0] = array1[i];
            arr[i * 2 + 1] = array2[i];
        }

        needsCalc = false;
        outArr.setRef(arr);
        outArrayLength.set(arr.length);
    }

    exeOut.trigger();
}
