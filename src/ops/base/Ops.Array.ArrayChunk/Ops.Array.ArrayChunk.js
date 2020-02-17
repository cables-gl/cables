// inputs
const inArrayPort = op.inArray("Input Array"),
    beginPort = op.inValueInt("Begin Index", 0),
    sizePort = op.inValueInt("Chunk Size", 1),
    circularPort = op.inValueBool("Circular", false),
    outArrayPort = op.outArray("Output Array"),
    outArrayLength = op.outNumber("Array length");


var newArr=[];

// functions
function setOutarray() {
    var inArr = inArrayPort.get();
    var begin = beginPort.get();
    var size = sizePort.get();
    var circular = circularPort.get();

    if(!inArr)
    {
        outArrayPort.set(null);
        return;
    }
    if(begin < 0) {
        begin = 0;
    }
    if(circular && begin >= inArr.length) {
        begin %= inArr.length;
    }

    if(!inArr || size < 1) {
        outArrayPort.set(null);
        return;
    }
    var end = size + begin;

    var newLen=Math.min(inArr.length,begin+end)-begin;
    newLen=Math.min(newLen,size);
    if(newLen > size) newLen=inArr.length;
    newArr.length=newLen;
    for(var i=begin;i<newLen+begin;i++)
    {
        newArr[i-begin]=inArr[i];
    }

    // var chunk = inArr.slice(begin, end);
    // // circular mode - if chunk does not contain enough elements, take more from the beginning
    // if(circular && chunk.length < size) {
    //     var remainingArrSize = size - chunk.length;
    //     var beginArr = inArr.slice(0, remainingArrSize);
    //     chunk.push.apply(chunk, beginArr);
    // }

    outArrayPort.set(null);
    outArrayLength.set(newLen);
    outArrayPort.set(newArr);
}

// change listeners
inArrayPort.onChange = setOutarray;
beginPort.onChange = setOutarray;
sizePort.onChange = setOutarray;
circularPort.onChange = setOutarray;

