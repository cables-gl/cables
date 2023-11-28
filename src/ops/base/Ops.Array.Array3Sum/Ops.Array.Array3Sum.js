const
    inArr = op.inArray("Array3x", 3),
    addX = op.inValue("Add X", 1),
    addY = op.inValue("Add Y", 1),
    addZ = op.inValue("Add Z", 1),
    outArr = op.outArray("Result");

outArr.setUiAttribs({ "stride": 3 });

let arr = [];

addY.onChange =
addX.onChange =
addZ.onChange =
inArr.onChange = function ()
{
    let newArr = inArr.get();
    if (newArr)
    {
        if (arr.length != newArr.length)arr.length = newArr.length;

        for (let i = 0; i < newArr.length; i += 3)
        {
            arr[i + 0] = newArr[i + 0] + addX.get();
            arr[i + 1] = newArr[i + 1] + addY.get();
            arr[i + 2] = newArr[i + 2] + addZ.get();
        }

        outArr.setRef(arr);
    }
    else
    {
        outArr.setRef(null);
    }
};
