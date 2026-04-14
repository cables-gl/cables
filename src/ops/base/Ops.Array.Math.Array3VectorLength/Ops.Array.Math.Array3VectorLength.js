const inArray = op.inArray("Array in", 3),
    outArray = op.outArray("Array out"),
    outArrayLength = op.outNumber("Array lengths"),
    newArr = [];

outArray.set(newArr);

let showingError = false;

inArray.onChange =
inArray.onChange = function ()
{
    let arr = inArray.get();

    if (!arr)
    {
        outArray.set(null);
        return;
    }

    if (newArr.length != arr.length)newArr.length = arr.length;

    newArr.length = Math.floor(arr.length / 3);

    if (arr.length % 3 !== 0)
    {
        if (!showingError)
        {
            op.uiAttr({ "error": "Arrays length not divisible by 3 !" });
            showingError = true;
        }
        return;
    }

    if (showingError)
    {
        showingError = false;
        op.uiAttr({ "error": null });
    }

    let vec = vec3.create();

    for (let i = 0; i < newArr.length; i++)
    {
        // get xyz components place into a vec3
        vec3.set(vec, arr[i * 3 + 0], arr[i * 3 + 1], arr[i * 3 + 2]);
        // get length of vector and place into array- note single number !
        newArr[i] = vec3.len(vec);
    }

    outArray.set(null);
    outArray.set(newArr);
    outArrayLength.set(newArr.length);
};
