const
    valueInPort = op.inValue("Value In", 0),
    passThroughPort = op.inValueBool("Pass Through"),
    inIfNot = op.inSwitch("When False", ["keep last number", "custom"], "keep last number"),
    inCustomNot = op.inFloat("Custom Value", 0),
    valueOutPort = op.outNumber("Value Out");

valueInPort.onChange = update;
passThroughPort.onChange = update;

valueInPort.changeAlways =
    valueOutPort.changeAlways = true;

inIfNot.onChange = updateUi;

function updateUi()
{
    inCustomNot.setUiAttribs({ "greyout": inIfNot.get() != "custom" });
    update();
}

function update()
{
    if (passThroughPort.get())
    {
        valueOutPort.set(valueInPort.get());
    }
    else
    {
        if (inIfNot.get() == "custom") valueOutPort.set(inCustomNot.get());
    }
}
