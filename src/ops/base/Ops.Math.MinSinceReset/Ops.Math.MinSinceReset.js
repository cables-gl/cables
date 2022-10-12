let valuePort = op.inValue("Value");
let resetPort = op.inTriggerButton("Reset");
let minPort = op.outNumber("Minimum");

let first;
let lastMin;

resetPort.onTriggered = reset;
valuePort.onChange = update;

reset();

function update()
{
    let value = valuePort.get();
    if (first)
    {
        minPort.set(value);
        lastMin = value;
    }
    else
    {
        lastMin = Math.min(lastMin, value);
        minPort.set(lastMin);
    }
    first = false;
}

function reset()
{
    first = true;
}
