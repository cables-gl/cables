const
    inArr = op.inArray("Array"),
    outObject = op.outObject("Buffer");

const packet = new Uint8ClampedArray(4 + 8 * 8 * 3);

inArr.onChange = function ()
{
    const arr = inArr.get();
    if (arr)
    {
        for (let i = 0; i < arr.length; i++) packet[i] = arr[i];
        outObject.set(packet.buffer);
    }
    else outObject.set(null);
};
