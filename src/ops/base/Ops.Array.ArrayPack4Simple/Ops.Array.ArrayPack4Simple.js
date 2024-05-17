const
    inArr1 = op.inArray("Array 1"),
    inArr2 = op.inArray("Array 2"),
    inArr3 = op.inArray("Array 3"),
    inArr4 = op.inArray("Array 4"),

    outArr = op.outArray("Array out", 4),
    outNum = op.outNumber("Num Points"),
    outArrayLength = op.outNumber("Array length");

let showingError = false;

let arr = [];
let emptyArray = [];
let needsCalc = true;

inArr1.onChange = inArr2.onChange = inArr3.onChange = inArr4.onChange = update;

function update()
{
    let array1 = inArr1.get();
    let array2 = inArr2.get();
    let array3 = inArr3.get();
    let array4 = inArr4.get();

    if (!array1 && !array2 && !array3 && !array4)
    {
        outArr.set(null);
        outNum.set(0);
        return;
    }
    let arrlen = 0;

    if (!array1 || !array2 || !array3 || !array4)
    {
        if (array1) arrlen = array1.length;
        else if (array2) arrlen = array2.length;
        else if (array3) arrlen = array3.length;
        else if (array4) arrlen = array4.length;

        if (emptyArray.length != arrlen)
            for (let i = 0; i < arrlen; i++) emptyArray[i] = 0;

        if (!array1)array1 = emptyArray;
        if (!array2)array2 = emptyArray;
        if (!array3)array3 = emptyArray;
        if (!array4)array4 = emptyArray;
    }

    if (
        (array1.length !== array2.length) ||
        (array2.length !== array3.length) ||
        (array3.length !== array4.length) ||
        (array1.length !== array4.length) ||
        (array1.length !== array3.length)
    )
    {
        op.setUiError("arraylen", "Arrays do not have the same length !", 1);
        return;
    }
    op.setUiError("arraylen", null);

    arr.length = array1.length * 4;
    for (let i = 0; i < array1.length; i++)
    {
        arr[i * 4 + 0] = array1[i];
        arr[i * 4 + 1] = array2[i];
        arr[i * 4 + 2] = array3[i];
        arr[i * 4 + 3] = array4[i];
    }

    needsCalc = false;
    outArr.setRef(arr);
    outNum.set(arr.length / 4);
    outArrayLength.set(arr.length);
}
