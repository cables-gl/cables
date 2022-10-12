const
    value = op.inValue("Radians"),
    result = op.outNumber("Result");

// convert radians into degrees
value.onChange = function ()
{
    result.set(
        value.get() * 180 / Math.PI
    );
};
