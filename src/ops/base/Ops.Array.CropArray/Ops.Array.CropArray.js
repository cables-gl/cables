const
    srcArrayPort = op.inArray("Source Array"),
    inStartIndex = op.inInt("Start Index"),
    newLengthPort = op.inInt("New Length", 20),
    croppedArrayOutPort = op.outArray("Cropped Array"),
    outArrayLength = op.outNumber("Array length");

inStartIndex.onChange = srcArrayPort.onChange = newLengthPort.onChange = setOutPort;

srcArrayPort.onLinkChanged = () =>
{
    srcArrayPort.copyLinkedUiAttrib("stride", croppedArrayOutPort);
};

function setOutPort()
{
    const srcArray = srcArrayPort.get();

    if (!srcArray)
    {
        croppedArrayOutPort.set(null);
        outArrayLength.set(0);
        return;
    }
    let newLength = parseInt(newLengthPort.get());
    const start = Math.floor(Math.abs(inStartIndex.get()));

    if (start + newLength >= srcArray.length) newLength = srcArray.length - start;
    if (start + newLength <= srcArray.length)
    {
        let croppedArr = srcArray.slice(start, start + newLength);
        croppedArrayOutPort.setRef(croppedArr);
        outArrayLength.set(croppedArr.length);
    }
}
