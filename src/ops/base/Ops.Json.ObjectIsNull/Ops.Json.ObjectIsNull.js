const inObj = op.inObject("Object");
const outResult = op.outBoolNum("Result");

inObj.onChange = function ()
{
    outResult.set(!inObj.get());
};
