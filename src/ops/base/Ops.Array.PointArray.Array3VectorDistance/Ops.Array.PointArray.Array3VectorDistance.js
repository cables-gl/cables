const inArray1 = op.inArray("Array in 1", null, 3),
    inArray2 = op.inArray("Array in 2", null, 3),
    outArray = op.outArray("Array out", null, 1),
    newArr = [];

outArray.set(newArr);

let showingError = false;

inArray1.onChange = inArray2.onChange = update;
function update()
{
    let arr1 = inArray1.get();
    let arr2 = inArray2.get();

    newArr.length = 0;

    if (!arr1 || !arr2)
    {
        outArray.set(null);
        return;
    }

    if (arr1.length !== arr2.length)
        op.setUiError("arraytriple", "Arrays do not have the same length !");
    else op.setUiError("arraytriple", null);

    if (showingError)
    {
        showingError = false;
        op.uiAttr({ "error": null });
    }

    if (newArr.length != arr1.length)newArr.length = arr1.length;

    let divisibleBy3 = newArr.length % 3 === 0;
    newArr.length = Math.floor(arr1.length / 3);

    if (divisibleBy3 === false) op.setUiError("arraytriple", "Arrays length not divisible by 3 !");
    else op.setUiError("arraytriple", null);

    let vec1 = vec3.create();
    let vec2 = vec3.create();

    for (let i = 0; i < newArr.length; i++)
    {
        vec3.set(vec1,
            arr1[i * 3 + 0],
            arr1[i * 3 + 1],
            arr1[i * 3 + 2]);

        vec3.set(vec2,
            arr2[i * 3 + 0],
            arr2[i * 3 + 1],
            arr2[i * 3 + 2]);

        newArr[i] = vec3.distance(vec1, vec2);
    }

    outArray.setRef(newArr);
}
