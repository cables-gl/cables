// inputs
var exePort = op.inFunctionButton('Execute');
var inArrayPort = op.inArray('Array');
var value1Port = op.inValue('Value 1');
var value2Port = op.inValue('Value 2');
var value3Port = op.inValue('Value 3');

// outputs
var nextPort = op.outFunction('Next');
var outArray=op.outArray("Result Array");

// change listeners
exePort.onTriggered = update;

inArrayPort.onChange=function()
{
    outArray.set(null);
    outArray.set(inArrayPort.get());
};

function update() {
    var arr = inArrayPort.get();
    if(arr) {
        arr.push(value1Port.get(), value2Port.get(), value3Port.get());
        nextPort.trigger();
    }
    outArray.set(null);
    outArray.set(arr);
}
