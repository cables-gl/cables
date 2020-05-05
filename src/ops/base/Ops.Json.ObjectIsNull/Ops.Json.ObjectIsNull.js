const inObj = op.inObject("Object");
const outResult = op.outValueBool("Result");

inObj.onChange = function ()
{
    outResult.set(!inObj.get());
};

