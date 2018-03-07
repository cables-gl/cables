var decibelsPort = op.inValue('Decibels');
var gainPort = op.outValue('Gain');

decibelsPort.onChange = update;

function update() {
    var decibels = decibelsPort.get();
    gainPort.set(Tone.dbToGain(decibels));
}