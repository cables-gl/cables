const
    valueInPort = op.inObject("Object In"),
    passThroughPort = op.inBool("Pass Through", false),
    onlyValid = op.inBool("Only Valid Objects", false),
    valueOutPort = op.outObject("Object Out");

valueInPort.onChange =
    passThroughPort.onChange = update;
valueInPort.changeAlways = true;

function update()
{
    if (!valueInPort.get() && onlyValid.get()) return;
    if (passThroughPort.get()) valueOutPort.set(valueInPort.get());
    // else valueOutPort.set(null);
}
