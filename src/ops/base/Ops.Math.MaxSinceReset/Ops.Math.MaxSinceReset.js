const valuePort = op.inValue("Value");
const resetPort = op.inTriggerButton("Reset");
const maxPort = op.outNumber("Maximum");

let first;
let lastMax;

// change listeners
resetPort.onTriggered = reset;
valuePort.onChange = update;

// init
reset();

/**
 * On Value change
 */
function update()
{
    let value = valuePort.get();
    if (first)
    {
        maxPort.set(value);
        lastMax = value;
    }
    else
    {
        lastMax = Math.max(lastMax, value);
        maxPort.set(lastMax);
    }
    first = false;
}

/**
 * On Reset
 */
function reset()
{
    first = true;
}
