const
    value = op.inFloat("Degrees"),
    result = op.outNumber("Result"),
    calculate = Math.cos;

// convert degrees into radians
value.onChange = function ()
{
    result.set(
        value.get() * Math.PI / 180
    );
};
