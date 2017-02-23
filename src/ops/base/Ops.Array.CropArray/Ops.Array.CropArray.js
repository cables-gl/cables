op.name="CropArray";

// input
var srcArrayPort = op.inArray("Source Array");
// non shallow copy untested
//var makeShallowCopyPort = op.addInPort( new Port( op, "Make Shallow Copy", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
//makeShallowCopyPort.set(true);
var newLengthPort = op.inValue("New Length");

// output
var croppedArrayOutPort = op.outArray("Cropped Array");

//change listeners
srcArrayPort.onChange = setOutPort;
newLengthPort.onChange = setOutPort;

// functions
function setOutPort() {
    //var makeShallowCopy = makeShallowCopyPort.get();
    var makeShallowCopy = true; // TODO Delete when non shallow copy is implemented
    var srcArray = srcArrayPort.get();
    op.log("Array Changed: ", srcArray);
    if(srcArray) {
        op.log("makeShallowCopy: ", makeShallowCopy);
        newLength = parseInt(newLengthPort.get());
        op.log("newLength: ", newLength);
        op.log("srcArray.length: ", srcArray.length);
        if(newLength <= srcArray.length) {
            if(makeShallowCopy) {
                var croppedArr = srcArray.slice(0, newLength);
                croppedArrayOutPort.set(croppedArr);
                op.log("Copied array: ", croppedArr);
            } else { // modify array
                /*
                srcArray = srcArray.splice(newLength, srcArray.length-newLength-1);
                croppedArrayOutPort.set(srcArray);
                op.log("Modified array: ", srcArray);
                */
            }
        }
    }
}