const valuePort = op.inFloat("Value");
const resetPort = op.inTriggerButton("Reset");
const minPort = op.outNumber("Minimum");

let first;
let lastMin;

resetPort.onTriggered = reset;
valuePort.onChange = update;
valuePort.onLinkChanged = reset;
op.on("EVENT_VALUESSET", reset);

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
    update();
}
