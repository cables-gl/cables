// inputs
var inArrPort = op.inArray('Array');

// outputs
var outArrayPort = op.outArray('Reversed Array', []);

// change listeners
inArrPort.onChange = function() {
    var inArr = inArrPort.get();
    var reversedArr = [];
    if(inArr && inArr.length >= 3) {
        // in case the array is not dividable by 3, get rid of the rest
        // e.g. length = 31 -> ignore the last value
        //      length = 30 -> perfect fit for [x, y, z, ...]
        var iStart = (Math.floor(inArr.length / 3) * 3) - 3;
        for(var i=iStart; i>=2; i-=3) {
            reversedArr.push(inArr[i], inArr[i+1], inArr[i+2]);
        }
    }
    outArrayPort.set(reversedArr);
};