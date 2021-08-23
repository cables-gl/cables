// input
const valueInPort = op.inValue("Value In", 0);
const passThroughPort = op.inBool("Pass Through");

// output
const valueOutPort = op.outValue("Value Out");

// change listeners
valueInPort.onChange = update;
passThroughPort.onChange = update;

valueInPort.changeAlways = true;
valueOutPort.changeAlways = true;

function update()
{
    if (passThroughPort.get())
    {
        valueOutPort.set(valueInPort.get());
    }
}
