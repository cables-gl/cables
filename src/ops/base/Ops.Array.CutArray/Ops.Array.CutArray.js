const srcArrayPort = op.inArray("Source Array");
const inStartIndex = op.inInt("Remove from Start");
const inEndIndex = op.inInt("Remove From End");
const croppedArrayOutPort = op.outArray("Cut Array");
const outArrayLength = op.outNumber("Array Length");

inStartIndex.onChange = inEndIndex.onChange = srcArrayPort.onChange = setOutPort;

function setOutPort()
{
    const srcArray = srcArrayPort.get();

    if (!srcArray)
    {
        croppedArrayOutPort.set(null);
        outArrayLength.set(0);
        return;
    }

    const oldLength = srcArray.length;
    const start = Math.max(0, Number(inStartIndex.get()));
    const end = Math.max(0, Number(inEndIndex.get()));

    const newArr = [];

    for (let i = start; i < oldLength - end; i += 1)
    {
        newArr.push(srcArray[i]);
    }

    croppedArrayOutPort.set(null);
    croppedArrayOutPort.set(newArr);
    outArrayLength.set(newArr.length);
}
