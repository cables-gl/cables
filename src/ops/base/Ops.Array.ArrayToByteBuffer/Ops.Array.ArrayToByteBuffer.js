const
    inArr=op.inArray("Array"),
    outObject=op.outObject("Buffer");

var packet = new Uint8ClampedArray(4 + 8*8 * 3);

inArr.onChange=function()
{
    var arr=inArr.get();
    if(arr)
    {
        for(var i=0;i<arr.length;i++)
        {
            packet[i]=arr[i];
        }
        outObject.set(packet.buffer);
        console.log('set');
    }
    else outObject.set(null);

};