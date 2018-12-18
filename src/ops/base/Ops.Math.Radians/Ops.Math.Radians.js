// input
var value = op.inValue('Degrees');

// output
var result = op.outValue('Result');

var calculate = Math.cos;

// convert degrees into radians
value.onChange=function()
{
    result.set(
        value.get() * Math.PI / 180
    );
};
