// constants
var ARRAY_LENGTH_DEFAULT = 10;
var INACTIVE_VALUE = 0;
var ACTIVE_VALUE = 1;

// variables
var stateArray = [];

// inputs
var arrayLengthPort = op.inValue('Array Length', ARRAY_LENGTH_DEFAULT);
var activeIndexPort = op.inValue('Active Index', 0);

// outputs
var stateArrayPort = op.outArray('State Array');

// change listeners
activeIndexPort.onChange = update;

// init
update();

// functions

function update() {
    var arrLength = arrayLengthPort.get();
    var activeIndex = activeIndexPort.get();
    for(var i=0; i<arrLength; i++) {
        if(i === activeIndex) {
            stateArray[i] = ACTIVE_VALUE;
        } else {
            stateArray[i] = INACTIVE_VALUE;
        }
    }
    stateArray.length = arrLength;
    stateArrayPort.set(null);
    stateArrayPort.set(stateArray);
}