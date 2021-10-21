// inputs
let inArrPort = op.inArray("Array");

// outputs
let outArrayPort = op.outArray("Reversed Array", []);

// change listeners
inArrPort.onChange = function ()
{
    let inArr = inArrPort.get();
    let reversedArr = [];
    if (inArr && inArr.length >= 3)
    {
        // in case the array is not dividable by 3, get rid of the rest
        // e.g. length = 31 -> ignore the last value
        //      length = 30 -> perfect fit for [x, y, z, ...]
        let iStart = (Math.floor(inArr.length / 3) * 3) - 3;
        for (let i = iStart; i >= 0; i -= 3)
        {
            reversedArr.push(inArr[i], inArr[i + 1], inArr[i + 2]);
        }
    }

    outArrayPort.set(null);
    outArrayPort.set(reversedArr);
};
