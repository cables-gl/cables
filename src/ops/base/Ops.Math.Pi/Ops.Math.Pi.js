const
    multiply = op.inValueFloat("Multiply amount", 1.0),
    p = op.outNumber("Pi", Math.PI);

multiply.onChange = function ()
{
    p.setValue(Math.PI * multiply.get());
};
