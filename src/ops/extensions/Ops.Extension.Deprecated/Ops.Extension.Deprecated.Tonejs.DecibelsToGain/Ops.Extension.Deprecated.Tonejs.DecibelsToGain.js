let decibelsPort = op.inFloat("Decibels");
let gainPort = op.outNumber("Gain");

decibelsPort.onChange = update;

function update()
{
    let decibels = decibelsPort.get();
    gainPort.set(Tone.dbToGain(decibels));
}
