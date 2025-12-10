let inIndex = op.inValueInt("Index");
let inArr = op.inArray("Array");

let outX = op.outValue("X");
let outY = op.outValue("Y");
let outZ = op.outValue("Z");

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
