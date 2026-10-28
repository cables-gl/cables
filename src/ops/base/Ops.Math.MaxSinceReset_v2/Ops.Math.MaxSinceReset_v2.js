const valuePort = op.inFloat("Value");
const resetPort = op.inTriggerButton("Reset");
const maxPort = op.outNumber("Maximum");

let first;
let lastMax;

resetPort.onTriggered = reset;
valuePort.onChange = update;
valuePort.onLinkChanged = reset;
reset();

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

function reset()
{
    first = true;
    update();
}
