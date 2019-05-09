const
    valueInPort = op.inObject('String In', 'hello'),
    passThroughPort = op.inValueBool('Pass Through',false),
    valueOutPort = op.outObject('Object Out',);

valueInPort.onChange =
    passThroughPort.onChange = update;

function update()
{
    if(passThroughPort.get())
        valueOutPort.set(valueInPort.get());

}