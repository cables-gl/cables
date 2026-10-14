let inIndex = op.inInt("Index");
let inArr = op.inArray("Array");

let outX = op.outNumber("X");
let outY = op.outNumber("Y");
let outZ = op.outNumber("Z");

inIndex.onChange = inArr.onChange = function ()
{
    let i = Math.floor(inIndex.get()) * 3;
    let arr = inArr.get();

    if (i < 0 || !arr)
    {

    }
    else
    {
        outX.set(arr[i + 0]);
        outY.set(arr[i + 1]);
        outZ.set(arr[i + 2]);
    }
};
