var valueBefore = -1;

// input
var valuePort = op.inValue('Value', -1);

// output
var outTrigger = op.outFunction('Became Zero Trigger'); 

valuePort.onChange = function() {
    var value = valuePort.get();
    if(valueBefore != 0 & value == 0) {
        outTrigger.trigger();
    }
    valueBefore = value;
};