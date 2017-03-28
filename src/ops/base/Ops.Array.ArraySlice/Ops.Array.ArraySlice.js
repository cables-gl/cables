op.name="ArraySlice";

// inputs
var inArrayPort = op.inArray("Input Array");
var beginPort = op.inValue("Begin Index", 0);
var endPort = op.inValue("End Index", 1);

// functions
function setOutarray() {
    var inArr = inArrayPort.get();
    var begin = beginPort.get();
    var end = endPort.get();
    if(!inArr) {
        outArrayPort.set([]);
        return;
    }
    outArrayPort.set(inArr.slice(begin, end));
}

// change listeners
inArrayPort.onChange = setOutarray;
beginPort.onChange = setOutarray;
endPort.onChange = setOutarray;

// outputs
var outArrayPort = op.outArray("Output Array");