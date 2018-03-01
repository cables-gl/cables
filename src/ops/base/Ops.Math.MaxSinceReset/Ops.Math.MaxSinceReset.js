// input
var valuePort = op.inValue('Value');
var resetPort = op.inFunctionButton('Reset');

// variables
var first;
var lastMax;

// output
var maxPort = op.outValue('Maximum');

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
        maxPort.set(value);
        lastMax = value;
    } else {
        lastMax = Math.max(lastMax, value);
        maxPort.set(lastMax);
    }
    first = false;
}

/**
 * On Reset
 */
function reset() {
    first = true;
}
