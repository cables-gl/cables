// input
var x = op.inValue('X');
var y = op.inValue('Y');

var phase = op.inValue('Phase', 0.0);
var mul = op.inValue('Frequency', 1.0);

// output
var result = op.outValue('Result');

x.onValueChanged = update;
y.onValueChanged = update;

function update() {
    result.set(
        mul.get() * Math.atan2( x.get() , y.get() ) + phase.get()
    );
}
