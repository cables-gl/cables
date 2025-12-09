let decibelsPort = op.inValue("Decibels");
let gainPort = op.outValue("Gain");

decibelsPort.onChange = update;

function update()
{
    let decibels = decibelsPort.get();
    gainPort.set(Tone.dbToGain(decibels));
}
