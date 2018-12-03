// input
var value = op.inValue('Value');

var phase = op.inValue('Phase', 0.0);
var mul = op.inValue('Frequency', 1.0);
var amplitude = op.inValue('Amplitude', 1.0);
var invert = op.inValueBool("asine", false);

// output
var result = op.outValue('Result');

var calculate = Math.tan;

value.onChange=function()
{
    result.set(
        amplitude.get() * calculate( ( value.get()*mul.get() ) + phase.get() )
    );
};

invert.onChange = function()
{
    if(invert.get()) calculate = Math.atan;
    else calculate = Math.tan;
}
