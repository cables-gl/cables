const
    valueInPort = op.inObject("Object In"),
    passThroughPort = op.inValueBool("Pass Through", false),
    onlyValid = op.inValueBool("Only Valid Objects", false),
    valueOutPort = op.outObject("Object Out");

valueInPort.onChange =
    passThroughPort.onChange = update;
valueInPort.changeAlways = true;

function update()
{
    if (!valueInPort.get() && onlyValid.get()) return;
    if (passThroughPort.get()) valueOutPort.setRef(valueInPort.get());
    // else valueOutPort.set(null);
}
