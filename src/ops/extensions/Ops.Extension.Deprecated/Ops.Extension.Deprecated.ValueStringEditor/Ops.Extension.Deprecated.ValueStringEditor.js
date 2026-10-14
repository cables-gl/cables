let v = op.inValueEditor("value", "");
let result = op.outNumber("Result");

v.onChange = function ()
{
    result.set(v.get());
};
