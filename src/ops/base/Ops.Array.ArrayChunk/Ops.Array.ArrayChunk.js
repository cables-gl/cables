const inArrayPort = op.inArray("Input Array"),
    beginPort = op.inValueInt("Begin Index", 0),
    sizePort = op.inValueInt("Chunk Size", 1),
    circularPort = op.inValueBool("Circular", false),
    outArrayPort = op.outArray("Output Array"),
    outArrayLength = op.outNumber("Array length");

let newArr = [];
inArrayPort.onChange = setOutarray;
beginPort.onChange = setOutarray;
sizePort.onChange = setOutarray;
circularPort.onChange = setOutarray;

function setOutarray()
{
    let inArr = inArrayPort.get();
    let begin = Math.floor(beginPort.get());
    let size = Math.floor(sizePort.get());
    let circular = circularPort.get();

    if (!inArr)
    {
        outArrayPort.set(null);
        return;
    }
    if (begin < 0)
    {
        begin = 0;
    }
    if (circular && begin >= inArr.length)
    {
        begin %= inArr.length;
    }

    if (!inArr || size < 1)
    {
        outArrayPort.set(null);
        return;
    }
    let end = size + begin;

    let newLen = Math.min(inArr.length, begin + end) - begin;
    if (newLen < 0)
    {
        // op.setUiError("idx", "invalid index/array length");
        newLen = 0;
    }
    else op.setUiError("idx", null);
    newLen = Math.min(newLen, size);

    if (newLen > size) newLen = inArr.length;
    newArr.length = newLen;
    for (let i = begin; i < newLen + begin; i++)
    {
        newArr[i - begin] = inArr[i];
    }

    outArrayLength.set(newLen);
    outArrayPort.setRef(newArr);
}
