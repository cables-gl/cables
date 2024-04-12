const
    valueInPort = op.inObject("Object In"),
    passThroughPort = op.inValueBool("Pass Through", true),
    inIfNull = op.inSwitch("When False", ["keep last object", "null"], "keep last object"),
    onlyValid = op.inValueBool("Only Valid Objects", false),

    valueOutPort = op.outObject("Object Out");

valueInPort.onChange =
    inIfNull.onChange =
    passThroughPort.onChange = update;
valueInPort.changeAlways = true;

function update()
{
    if (!valueInPort.get() && onlyValid.get()) return;
    if (passThroughPort.get()) valueOutPort.setRef(valueInPort.get());
    else
    {
        if (inIfNull.get() == "null") valueOutPort.setRef(null);
    }
}
