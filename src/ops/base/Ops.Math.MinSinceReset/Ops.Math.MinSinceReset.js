// input
var valuePort = op.inValue('Value');
var resetPort = op.inFunctionButton('Reset');

// variables
var first;
var lastMin;

// output
var minPort = op.outValue('Minimum');

// change listeners
resetPort.onTriggered = reset;
valuePort.onChange = update;

// init
reset();

/**
 * On Value change
 */
function update() {
    var value = valuePort.get();
    if(first) {
        minPort.set(value);
        lastMin = value;
    } else {
        lastMin = Math.min(lastMin, value);
        minPort.set(lastMin);
    }
    first = false;
}

/**
 * On Reset
 */
function reset() {
    first = true;
}
