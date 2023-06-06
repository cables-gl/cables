const
    inArrays = op.inArray("Array"),
    outArr = op.outArray("Result");

inArrays.onLinkChanged =
inArrays.onChange = function ()
{
    let inArr = inArrays.get();

    let arr = [];

    if (!inArr)
    {
        outArr.setRef([]);
        return;
    }

    for (let i = 0; i < inArr.length; i++)
    {
        let pointArray = inArr[i];

        for (let j = 3; j < pointArray.length - 3; j += 3)
        {
            arr.push(pointArray[j - 3]);
            arr.push(pointArray[j - 2]);
            arr.push(pointArray[j - 1]);
            arr.push(pointArray[j + 0]);
            arr.push(pointArray[j + 1]);
            arr.push(pointArray[j + 2]);
        }
    }

    outArr.setRef(arr);
};
