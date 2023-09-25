const exe = op.inTrigger("Trigger in"),
    inArr1 = op.inArray("Array 1"),
    inArr2 = op.inArray("Array 2"),
    inArr3 = op.inArray("Array 3"),
    exeOut = op.outTrigger("Trigger out"),
    outArr = op.outArray("Array out", 3),
    outNum = op.outNumber("Num Points"),
    outArrayLength = op.outNumber("Array length");

let showingError = false;

let arr = [];
let emptyArray = [];
let needsCalc = true;

exe.onTriggered = update;

inArr1.onChange = inArr2.onChange = inArr3.onChange = calcLater;

function calcLater()
{
    needsCalc = true;
}

function update()
{
    let array1 = inArr1.get();
    let array2 = inArr2.get();
    let array3 = inArr3.get();

    if (!array1 && !array2 && !array3)
    {
        outArr.set(null);
        outNum.set(0);
        return;
    }
    // only update if array has changed
    if (needsCalc)
    {
        let arrlen = 0;

        if (!array1 || !array2 || !array3)
        {
            if (array1) arrlen = array1.length;
            else if (array2) arrlen = array2.length;
            else if (array3) arrlen = array3.length;

            if (emptyArray.length != arrlen)
                for (let i = 0; i < arrlen; i++) emptyArray[i] = 0;

            if (!array1)array1 = emptyArray;
            if (!array2)array2 = emptyArray;
            if (!array3)array3 = emptyArray;
        }

        if ((array1.length !== array2.length) || (array2.length !== array3.length))
        {
            op.setUiError("arraylen", "Arrays do not have the same length !");
            return;
        }
        op.setUiError("arraylen", null);

        arr.length = array1.length;
        for (let i = 0; i < array1.length; i++)
        {
            arr[i * 3 + 0] = array1[i];
            arr[i * 3 + 1] = array2[i];
            arr[i * 3 + 2] = array3[i];
        }

        needsCalc = false;
        outArr.setRef(arr);
        outNum.set(arr.length / 3);
        outArrayLength.set(arr.length);
    }

    exeOut.trigger();
}
