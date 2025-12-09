let v = op.inValueEditor("value", "");
let result = op.outValue("Result");

v.onChange = function ()
{
    result.set(v.get());
};
