const
    valueInPort = op.inString("String In", "hello"),
    passThroughPort = op.inValueBool("Pass Through", false),
    inIfNot = op.inSwitch("When False", ["keep last string", "custom"], "keep last string"),
    inCustomNot = op.inString("Custom Value"),
    valueOutPort = op.outString("String Out", "");

valueInPort.onChange =
    passThroughPort.onChange = update;

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
        valueOutPort.set("");
        valueOutPort.set(valueInPort.get());
    }
    else
    {
        if (inIfNot.get() == "custom") valueOutPort.set(inCustomNot.get());
    }
}
