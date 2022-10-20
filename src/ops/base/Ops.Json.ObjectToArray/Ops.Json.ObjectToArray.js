const inObj = op.inObject("Object");
const outArray = op.outArray("Array");

inObj.onChange = function ()
{
    outArray.set(inObj.get());
};
