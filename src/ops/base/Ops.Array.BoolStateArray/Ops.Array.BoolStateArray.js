// constants
let ARRAY_LENGTH_DEFAULT = 10;
let INACTIVE_VALUE = 0;
let ACTIVE_VALUE = 1;

// variables
let stateArray = [];

// inputs
let arrayLengthPort = op.inValue("Array Length", ARRAY_LENGTH_DEFAULT);
let activeIndexPort = op.inValue("Active Index", 0);
let inactiveValuePort = op.inValue("Inactive Value", 0);
let activeValuePort = op.inValue("Active Value", 1);

// outputs
let stateArrayPort = op.outArray("State Array");

// change listeners
arrayLengthPort.onChange = update;
activeIndexPort.onChange = update;
inactiveValuePort.onChange = update;
activeValuePort.onChange = update;

// init
update();

// functions

function update()
{
    let arrLength = Math.max(0, arrayLengthPort.get());
    let activeIndex = Math.round(activeIndexPort.get());
    let inactiveValue = inactiveValuePort.get();
    let activeValue = activeValuePort.get();
    for (let i = 0; i < arrLength; i++)
    {
        if (i === activeIndex)
        {
            stateArray[i] = activeValue;
        }
        else
        {
            stateArray[i] = inactiveValue;
        }
    }
    stateArray.length = arrLength;
    stateArrayPort.set(null);
    stateArrayPort.set(stateArray);
}
