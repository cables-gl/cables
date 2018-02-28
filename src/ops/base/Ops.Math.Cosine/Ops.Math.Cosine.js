// input
var value = op.inValue('Value');
var amplitude = op.inValue('Amplitude', 1.0);
var mul = op.inValue('Frequency', 1.0);
var phase = op.inValue('Phase', 0.0);

// output
var result = op.outValue('Result');

// change listener
value.onValueChanged = update;

function update() {
    result.set(
        amplitude.get() * Math.cos( ( value.get() * mul.get() ) + phase.get())
    );
}
