// input
var value = op.inValue('Radians');

// output
var result = op.outValue('Result');

var calculate = Math.cos;

// convert radians into degrees
value.onChange=function()
{
    result.set(
        value.get() * 180 / Math.PI 
    );
};
