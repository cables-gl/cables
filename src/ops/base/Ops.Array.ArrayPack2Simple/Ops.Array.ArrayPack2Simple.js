const
    inArr1 = op.inArray("Array 1"),
    inArr2 = op.inArray("Array 2"),

    outArr = op.outArray("Array out", 2),
    outNum = op.outNumber("Num Points"),
    outArrayLength = op.outNumber("Array length");

let showingError = false;

let arr = [];
let emptyArray = [];
let needsCalc = true;

inArr1.onChange = inArr2.onChange = update;

function update()
{
    let array1 = inArr1.get();
    let array2 = inArr2.get();

    if (!array1 && !array2)
    {
        outArr.set(null);
        outNum.set(0);
        return;
    }
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
        op.setUiError("arraylen", "Arrays do not have the same length !");
        return;
    }
    op.setUiError("arraylen", null);

    arr.length = array1.length;
    for (let i = 0; i < array1.length; i++)
    {
        arr[i * 2 + 0] = array1[i];
        arr[i * 2 + 1] = array2[i];
    }

    needsCalc = false;
    outArr.setRef(arr);
    outNum.set(arr.length / 2);
    outArrayLength.set(arr.length);
}
