// inputs
var inArrayPort = op.inArray("Input Array");
var beginPort = op.inValue("Begin Index", 0);
var sizePort = op.inValue("Chunk Size", 1);
var circularPort = op.inValueBool("Circular", false);

// functions
function setOutarray() {
    var inArr = inArrayPort.get();
    var begin = beginPort.get();
    var size = sizePort.get();
    var circular = circularPort.get();
    
    if(begin < 0) {
        begin = 0;
    }
    if(circular && begin >= inArr.length) {
        begin %= inArr.length;
    }
    
    if(!inArr || size < 1) {
        outArrayPort.set([]);
        return;
    }
    var end = size + begin;
    var chunk = inArr.slice(begin, end);
    // circular mode - if chunk does not contain enough elements, take more from the beginning
    if(circular && chunk.length < size) {
        var remainingArrSize = size - chunk.length;
        var beginArr = inArr.slice(0, remainingArrSize);
        chunk.push.apply(chunk, beginArr);
    }
    outArrayPort.set(chunk);
}

// change listeners
inArrayPort.onChange = setOutarray;
beginPort.onChange = setOutarray;
sizePort.onChange = setOutarray;
circularPort.onChange = setOutarray;

// outputs
var outArrayPort = op.outArray("Output Array");