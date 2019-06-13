// constants
var ARRAY_LENGTH_DEFAULT = 10;
var INACTIVE_VALUE = 0;
var ACTIVE_VALUE = 1;

// variables
var stateArray = [];

// inputs
var arrayLengthPort = op.inValue('Array Length', ARRAY_LENGTH_DEFAULT);
var activeIndexPort = op.inValue('Active Index', 0);
var inactiveValuePort = op.inValue('Inactive Value', 0);
var activeValuePort = op.inValue('Active Value', 1);

// outputs
var stateArrayPort = op.outArray('State Array');

// change listeners
arrayLengthPort.onChange = update;
activeIndexPort.onChange = update;
inactiveValuePort.onChange = update;
activeValuePort.onChange = update;

// init
update();

// functions

function update() {
    var arrLength = arrayLengthPort.get();
    var activeIndex = Math.round(activeIndexPort.get());
    var inactiveValue = inactiveValuePort.get();
    var activeValue = activeValuePort.get();
    for(var i=0; i<arrLength; i++) {
        if(i === activeIndex) {
            stateArray[i] = activeValue;
        } else {
            stateArray[i] = inactiveValue;
        }
    }
    stateArray.length = arrLength;
    stateArrayPort.set(null);
    stateArrayPort.set(stateArray);
}