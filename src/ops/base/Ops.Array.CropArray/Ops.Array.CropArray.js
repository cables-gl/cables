const
    srcArrayPort = op.inArray("Source Array"),
    inStartIndex = op.inInt("Start Index"),
    newLengthPort = op.inInt("New Length"),
    croppedArrayOutPort = op.outArray("Cropped Array"),
    outArrayLength = op.outNumber("Array length");

inStartIndex.onChange = srcArrayPort.onChange = newLengthPort.onChange = setOutPort;

function setOutPort()
{
    const srcArray = srcArrayPort.get();

    if(!srcArray)
    {
        croppedArrayOutPort.set(null);
        outArrayLength.set(0);
        return;
    }
    var newLength = parseInt(newLengthPort.get());
    const start=Math.floor(Math.abs(inStartIndex.get()));

    if(start+newLength >= srcArray.length) newLength = srcArray.length-start;
    if(start+newLength <= srcArray.length)
    {
        var croppedArr = srcArray.slice(start, start+newLength);
        croppedArrayOutPort.set(null);
        croppedArrayOutPort.set(croppedArr);
        outArrayLength.set(croppedArr.length);
    }

}