const
    srcArrayPort = op.inArray("Source Array"),
    newLengthPort = op.inInt("New Length"),
    croppedArrayOutPort = op.outArray("Cropped Array"),
    outArrayLength = op.outNumber("Array length");

//change listeners
srcArrayPort.onChange = newLengthPort.onChange = setOutPort;

// functions
function setOutPort()
{
    var srcArray = srcArrayPort.get();

    if(!srcArray)
    {
        croppedArrayOutPort.set(null);
        outArrayLength.set(0);
        return;
    }
    var newLength = parseInt(newLengthPort.get());
    if(newLength >= srcArray.lenngth) newLength = srcArray.length;
    if(newLength <= srcArray.length)
    {
            var croppedArr = srcArray.slice(0, newLength);
            croppedArrayOutPort.set(null);
            croppedArrayOutPort.set(croppedArr);
            outArrayLength.set(croppedArr.length);
    }


}