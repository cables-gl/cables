op.name="CopyArray";

// input ports
var srcArrayPort = op.inArray("Source Array");

// output ports
var srcArrayOutPort = op.outArray("Source Array Out");
var arrayCopyPort = op.outArray("Array Copy");

// change listeners
srcArrayPort.onChange = function() {
    var srcArray = srcArrayPort.get();
    if(srcArray) {
        var arrCopy = JSON.parse(JSON.stringify(srcArray));    
        srcArrayOutPort.set(srcArray);
        arrayCopyPort.set(arrCopy);
        op.log(arrCopy);
    } else {
        srcArrayOutPort.set([]);
        arrayCopyPort.set([]);
    }
};
